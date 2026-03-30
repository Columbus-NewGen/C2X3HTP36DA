package repository

import (
	"context"
	"io"
	"mime/multipart"
	"strings"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/utils"
	"github.com/minio/minio-go/v7"
	"github.com/pkg/errors"
)

type mediaRepository struct {
	client     *minio.Client
	bucketName string
}

func NewMediaRepository() domain.MediaRepository {
	client, err := utils.GetMinIOClient()
	if err != nil {
		return &disabledMediaRepository{}
	}

	return &mediaRepository{
		client:     client,
		bucketName: utils.GetBucketName(),
	}
}

type disabledMediaRepository struct{}

func (r *disabledMediaRepository) Upload(key string, file *multipart.FileHeader) error {
	return errors.New("[MediaRepository.Upload]: Media storage disabled")
}

func (r *disabledMediaRepository) Get(key string) ([]byte, string, error) {
	return nil, "", errors.New("[MediaRepository.Get]: Media storage disabled")
}

func (r *disabledMediaRepository) Delete(key string) error {
	return errors.New("[MediaRepository.Delete]: Media storage disabled")
}

func (r *disabledMediaRepository) Exists(key string) (bool, error) {
	return false, errors.New("[MediaRepository.Exists]: Media storage disabled")
}

// Upload stores a file in MinIO
func (r *mediaRepository) Upload(key string, file *multipart.FileHeader) error {
	ctx := context.Background()

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return errors.Wrap(err, "[MediaRepository.Upload]: Failed to open file")
	}
	defer src.Close()

	// Determine content type
	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		// Fallback to guessing from extension
		contentType = getContentTypeFromExtension(key)
	}

	// Upload to MinIO
	_, err = r.client.PutObject(
		ctx,
		r.bucketName,
		key,
		src,
		file.Size,
		minio.PutObjectOptions{
			ContentType: contentType,
		},
	)
	if err != nil {
		return errors.Wrap(err, "[MediaRepository.Upload]: Failed to upload to MinIO")
	}

	return nil
}

// Get retrieves a file from MinIO
func (r *mediaRepository) Get(key string) ([]byte, string, error) {
	ctx := context.Background()

	// Get object from MinIO
	object, err := r.client.GetObject(ctx, r.bucketName, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, "", errors.Wrap(err, "[MediaRepository.Get]: Failed to get object from MinIO")
	}
	defer object.Close()

	// Get object info for content type
	stat, err := object.Stat()
	if err != nil {
		return nil, "", errors.Wrap(err, "[MediaRepository.Get]: Failed to stat object")
	}

	// Read object data
	data, err := io.ReadAll(object)
	if err != nil {
		return nil, "", errors.Wrap(err, "[MediaRepository.Get]: Failed to read object data")
	}

	contentType := stat.ContentType
	if contentType == "" {
		contentType = getContentTypeFromExtension(key)
	}

	return data, contentType, nil
}

// Delete removes a file from MinIO
func (r *mediaRepository) Delete(key string) error {
	ctx := context.Background()

	err := r.client.RemoveObject(ctx, r.bucketName, key, minio.RemoveObjectOptions{})
	if err != nil {
		return errors.Wrap(err, "[MediaRepository.Delete]: Failed to delete object from MinIO")
	}

	return nil
}

// Exists checks if a file exists in MinIO
func (r *mediaRepository) Exists(key string) (bool, error) {
	ctx := context.Background()

	_, err := r.client.StatObject(ctx, r.bucketName, key, minio.StatObjectOptions{})
	if err != nil {
		// Check if error is "object not found"
		errResponse := minio.ToErrorResponse(err)
		if errResponse.Code == "NoSuchKey" {
			return false, nil
		}
		return false, errors.Wrap(err, "[MediaRepository.Exists]: Failed to check object existence")
	}

	return true, nil
}

// getContentTypeFromExtension returns content type based on file extension
func getContentTypeFromExtension(filename string) string {
	ext := strings.ToLower(filename[strings.LastIndex(filename, "."):])
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	default:
		return "application/octet-stream"
	}
}
