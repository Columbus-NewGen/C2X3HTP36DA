package constant

const (
	// MaxImageSize defines the maximum allowed image file size (5MB)
	MaxImageSize = 5 * 1024 * 1024 // 5MB in bytes

	// Error messages
	InvalidFileType     = "invalid file type"
	FileTooLarge        = "file size exceeds limit"
	MediaUploadFailed   = "failed to upload media"
	MediaNotFound       = "media not found"
	MediaDeleteFailed   = "failed to delete media"
	InvalidEntityType   = "invalid entity type"
	MissingFile         = "file is required"
	MediaRetrieveFailed = "failed to retrieve media"
)

// AllowedImageTypes defines supported image MIME types
var AllowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// AllowedImageExtensions defines supported file extensions
var AllowedImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

// EntityTypes defines valid entity types for media upload
var EntityTypes = map[string]bool{
	"equipment": true,
	"exercise":  true,
	"user":      true,
}
