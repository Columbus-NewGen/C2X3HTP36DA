package response

// MediaUploadResponse represents the response after successful media upload
type MediaUploadResponse struct {
	Key      string `json:"key"`       // MinIO key (e.g., "equipment/uuid.jpg")
	URL      string `json:"url"`       // Full retrieval URL (e.g., "/api/v1/media/equipment/uuid.jpg")
	FileName string `json:"file_name"` // Original filename
	FileSize int64  `json:"file_size"` // File size in bytes
	MimeType string `json:"mime_type"` // MIME type
}
