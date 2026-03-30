package usecase

import (
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type mediaUsecase struct {
	mediaRepo domain.MediaRepository
}

// NewMediaUsecase creates a new media usecase instance
func NewMediaUsecase(mediaRepo domain.MediaRepository) domain.MediaUsecase {
	return &mediaUsecase{
		mediaRepo: mediaRepo,
	}
}

// UploadImage validates and uploads an image file
func (u *mediaUsecase) UploadImage(file *multipart.FileHeader, entityType string) (*response.MediaUploadResponse, error) {
	// Validate entity type
	if !constant.EntityTypes[entityType] {
		return nil, errors.New(constant.InvalidEntityType)
	}

	// Validate image file
	if err := u.ValidateImage(file); err != nil {
		return nil, errors.Wrap(err, "[MediaUsecase.UploadImage]: Validation failed")
	}

	// Generate unique key: entityType/uuid.ext
	ext := strings.ToLower(filepath.Ext(file.Filename))
	key := fmt.Sprintf("%s/%s%s", entityType, uuid.New().String(), ext)

	// Upload to MinIO
	if err := u.mediaRepo.Upload(key, file); err != nil {
		return nil, errors.Wrap(err, "[MediaUsecase.UploadImage]: Upload failed")
	}

	// Build response
	return &response.MediaUploadResponse{
		Key:      key,
		URL:      fmt.Sprintf("/api/v1/media/%s", key),
		FileName: file.Filename,
		FileSize: file.Size,
		MimeType: file.Header.Get("Content-Type"),
	}, nil
}

// GetMedia retrieves a media file by key
func (u *mediaUsecase) GetMedia(key string) ([]byte, string, error) {
	// Check if media exists
	exists, err := u.mediaRepo.Exists(key)
	if err != nil {
		return nil, "", errors.Wrap(err, "[MediaUsecase.GetMedia]: Failed to check existence")
	}

	if !exists {
		return nil, "", errors.New(constant.MediaNotFound)
	}

	// Retrieve media
	data, contentType, err := u.mediaRepo.Get(key)
	if err != nil {
		return nil, "", errors.Wrap(err, "[MediaUsecase.GetMedia]: Failed to retrieve media")
	}

	return data, contentType, nil
}

// DeleteMedia removes a media file by key
func (u *mediaUsecase) DeleteMedia(key string) error {
	// Check if media exists
	exists, err := u.mediaRepo.Exists(key)
	if err != nil {
		return errors.Wrap(err, "[MediaUsecase.DeleteMedia]: Failed to check existence")
	}

	if !exists {
		return errors.New(constant.MediaNotFound)
	}

	// Delete from MinIO
	if err := u.mediaRepo.Delete(key); err != nil {
		return errors.Wrap(err, "[MediaUsecase.DeleteMedia]: Failed to delete media")
	}

	return nil
}

// UpdateImage overwrites an existing media file with a new one using the same key
func (u *mediaUsecase) UpdateImage(key string, file *multipart.FileHeader) (*response.MediaUploadResponse, error) {
	// Validate image file
	if err := u.ValidateImage(file); err != nil {
		return nil, errors.Wrap(err, "[MediaUsecase.UpdateImage]: Validation failed")
	}

	// Check if the key exists in MinIO
	exists, err := u.mediaRepo.Exists(key)
	if err != nil {
		return nil, errors.Wrap(err, "[MediaUsecase.UpdateImage]: Failed to check existence")
	}
	if !exists {
		return nil, errors.New(constant.MediaNotFound)
	}

	// Overwrite with new file (MinIO PutObject overwrites in-place)
	if err := u.mediaRepo.Upload(key, file); err != nil {
		return nil, errors.Wrap(err, "[MediaUsecase.UpdateImage]: Upload failed")
	}

	return &response.MediaUploadResponse{
		Key:      key,
		URL:      fmt.Sprintf("/api/v1/media/%s", key),
		FileName: file.Filename,
		FileSize: file.Size,
		MimeType: file.Header.Get("Content-Type"),
	}, nil
}

// ValidateImage validates file size and type
func (u *mediaUsecase) ValidateImage(file *multipart.FileHeader) error {
	if file == nil {
		return errors.New(constant.MissingFile)
	}

	// Check file size
	if file.Size > constant.MaxImageSize {
		return errors.New(constant.FileTooLarge)
	}

	// Check MIME type
	contentType := file.Header.Get("Content-Type")
	if !constant.AllowedImageTypes[contentType] {
		return errors.New(constant.InvalidFileType)
	}

	// Check file extension (double-check)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !constant.AllowedImageExtensions[ext] {
		return errors.New(constant.InvalidFileType)
	}

	return nil
}
