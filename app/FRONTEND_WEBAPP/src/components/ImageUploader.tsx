import React, { useCallback, useRef, useState } from "react";
import {
  X,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Replace,
} from "lucide-react";
import { mediaApi } from "../services/Media";

/**
 * ImageUploader Component
 * Auto-upload, instant preview, validation
 * Returns { key, url } for easy integration
 */

export type EntityType = "equipment" | "exercise" | "user";

export interface ImageUploadResult {
  key: string;
  url: string;
}

export interface ImageUploaderProps {
  entityType: EntityType;
  initialImageUrl?: string | null;
  onUploadComplete?: (result: ImageUploadResult) => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploader({
  entityType,
  initialImageUrl = null,
  onUploadComplete,
  onRemove,
  className = "",
  disabled = false,
  placeholder = "No image",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Create full URL from relative path or key
  const getFullImageUrl = useCallback((url: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("/")) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || "";
      const baseUrl = serverUrl.replace(/\/$/, "");
      return `${baseUrl}${url}`;
    }
    // Relative path like "exercise/..."
    const serverUrl = import.meta.env.VITE_SERVER_URL || "";
    const baseUrl = serverUrl.replace(/\/$/, "");
    return `${baseUrl}/api/v1/media/${url}`;
  }, []);

  // Initialize preview from initialImageUrl
  React.useEffect(() => {
    if (initialImageUrl) {
      setPreviewUrl(getFullImageUrl(initialImageUrl));
    } else {
      setPreviewUrl(null);
    }
  }, [initialImageUrl, getFullImageUrl]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }

    // Check file extension (extra safety)
    const extension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(
        ", "
      )}`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);

      try {
        // Create preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const result = await mediaApi.upload(file, entityType);

        // result.url is relative path like "/api/v1/media/exercise/..."
        // or key like "exercise/..."
        // Convert to full URL for preview
        let imageUrl: string;
        if (result.url.startsWith("/")) {
          // Full path like "/api/v1/media/exercise/..."
          const fullUrl = getFullImageUrl(result.url);
          imageUrl = fullUrl || result.url;
        } else {
          // Key like "exercise/..." - convert to full URL
          const serverUrl = import.meta.env.VITE_SERVER_URL || "";
          const baseUrl = serverUrl.replace(/\/$/, "");
          imageUrl = `${baseUrl}/api/v1/media/${result.url}`;
        }

        setPreviewUrl(imageUrl);

        // Call callback with result - return key for API submission
        if (onUploadComplete) {
          onUploadComplete({
            key: result.key, // "exercise/550e8400-..."
            url: result.url, // "/api/v1/media/exercise/..." or key
          });
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload image";
        setError(errorMessage);
        console.error("Image upload error:", err);
        // Revert preview on error
        setPreviewUrl(
          initialImageUrl ? getFullImageUrl(initialImageUrl) : null
        );
      } finally {
        setUploading(false);
      }
    },
    [entityType, onUploadComplete, initialImageUrl, getFullImageUrl]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled, uploading]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !uploading) {
        setDragActive(true);
      }
    },
    [disabled, uploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  const handleClick = useCallback(() => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, uploading]);

  const displayUrl = previewUrl || null;
  const hasImage = displayUrl !== null;

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer",
          dragActive
            ? "border-lime-400 bg-lime-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "cursor-wait",
          hasImage && "border-solid border-gray-200 bg-white p-0"
        )}
      >
        {hasImage ? (
          // Image Preview
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 group">
            {/* Image */}
            <img
              src={displayUrl}
              alt="Preview"
              className={cn(
                "w-full h-full object-cover transition-all",
                uploading && "blur-sm brightness-75"
              )}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const img = e.currentTarget;
                img.style.display = "none";
                const parent = img.parentElement;
                if (parent) {
                  const placeholder = document.createElement("div");
                  placeholder.className =
                    "w-full h-full flex items-center justify-center bg-gray-100";
                  placeholder.innerHTML = `
                    <div class="text-center text-gray-400">
                      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p class="text-sm">Image not available</p>
                    </div>
                  `;
                  parent.appendChild(placeholder);
                }
              }}
            />

            {/* Uploading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                  <p className="text-sm text-white font-medium">Uploading...</p>
                </div>
              </div>
            )}

            {/* Action Buttons (on hover) */}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Replace className="h-4 w-4" />
                    Replace
                  </button>
                  {onRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="px-4 py-2 bg-white text-rose-600 rounded-lg font-medium text-sm hover:bg-rose-50 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="w-full aspect-video flex flex-col items-center justify-center p-6">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-lime-500 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gray-200 mb-3">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {dragActive ? "Drop image here" : "Click or drag to upload"}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  {placeholder}
                  <br />
                  JPG, PNG, GIF, WebP (max {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto shrink-0 text-rose-600 hover:text-rose-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
