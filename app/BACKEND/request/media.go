package request

import "mime/multipart"

// UploadMediaRequest represents the request for media upload
// Note: File binding is handled via c.FormFile() in the handler
type UploadMediaRequest struct {
	File       *multipart.FileHeader `form:"file" binding:"required"`
	EntityType string                `form:"entity_type" binding:"required,oneof=equipment exercise user"`
}
