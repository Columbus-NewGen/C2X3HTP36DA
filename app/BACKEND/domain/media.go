package domain

import (
	"mime/multipart"

	"github.com/gymmate/backend/response"
)

// MediaUsecase defines the business logic for media operations
type MediaUsecase interface {
	// UploadImage validates and uploads an image file
	UploadImage(file *multipart.FileHeader, entityType string) (*response.MediaUploadResponse, error)

	// GetMedia retrieves a media file by key
	// Returns file bytes and content type
	GetMedia(key string) ([]byte, string, error)

	// DeleteMedia removes a media file by key
	DeleteMedia(key string) error

	// UpdateImage overwrites an existing media file with a new one using the same key
	UpdateImage(key string, file *multipart.FileHeader) (*response.MediaUploadResponse, error)

	// ValidateImage validates file size and type
	ValidateImage(file *multipart.FileHeader) error
}

// MediaRepository defines the data access layer for media storage
type MediaRepository interface {
	// Upload stores a file in MinIO
	Upload(key string, file *multipart.FileHeader) error

	// Get retrieves a file from MinIO
	// Returns file bytes and content type
	Get(key string) ([]byte, string, error)

	// Delete removes a file from MinIO
	Delete(key string) error

	// Exists checks if a file exists in MinIO
	Exists(key string) (bool, error)
}
