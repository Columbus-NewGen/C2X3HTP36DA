package utils

import (
	"context"
	"os"
	"strings"
	"sync"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var (
	minioClient *minio.Client
	minioOnce   sync.Once
	bucketName  string
	initErr     error
)

func InitMinIOClient() error {
	minioOnce.Do(func() {
		disabled := strings.ToLower(os.Getenv("MINIO_DISABLED"))
		if disabled == "1" || disabled == "true" || disabled == "yes" {
			bucketName = os.Getenv("MINIO_BUCKET_NAME")
			minioClient = nil
			initErr = nil
			log.Info("[MinIO.Init]: MinIO disabled")
			return
		}

		endpoint := os.Getenv("MINIO_ENDPOINT")
		accessKey := os.Getenv("MINIO_ACCESS_KEY")
		secretKey := os.Getenv("MINIO_SECRET_KEY")
		bucketName = os.Getenv("MINIO_BUCKET_NAME")

		if endpoint == "" || accessKey == "" || secretKey == "" || bucketName == "" {
			initErr = errors.New("[MinIO.Init]: Missing required environment variables")
			log.Error(initErr)
			return
		}

		endpoint = strings.TrimPrefix(endpoint, "http://")
		endpoint = strings.TrimPrefix(endpoint, "https://")

		client, err := minio.New(endpoint, &minio.Options{
			Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
			Secure: false, // Set to true for HTTPS
		})
		if err != nil {
			initErr = errors.Wrap(err, "[MinIO.Init]: Failed to create client")
			log.Error(initErr)
			return
		}

		ctx := context.Background()
		exists, err := client.BucketExists(ctx, bucketName)
		if err != nil {
			initErr = errors.Wrap(err, "[MinIO.Init]: Failed to check bucket")
			log.Error(initErr)
			return
		}

		if !exists {
			err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
			if err != nil {
				initErr = errors.Wrap(err, "[MinIO.Init]: Failed to create bucket")
				log.Error(initErr)
				return
			}
			log.Infof("[MinIO.Init]: Created bucket: %s", bucketName)
		}

		minioClient = client
		log.Infof("[MinIO.Init]: MinIO client initialized successfully (endpoint: %s, bucket: %s)", endpoint, bucketName)
	})

	return initErr
}

func GetMinIOClient() (*minio.Client, error) {
	if minioClient == nil {
		return nil, errors.New("[MinIO.GetClient]: Client not initialized, call InitMinIOClient first")
	}
	return minioClient, nil
}

func GetBucketName() string {
	return bucketName
}
