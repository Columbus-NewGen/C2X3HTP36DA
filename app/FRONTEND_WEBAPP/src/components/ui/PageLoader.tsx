import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  /** Message below spinner. Default: "กำลังโหลด..." */
  message?: string;
  /**
   * - "page" = full page (min-h-screen, centered, bg-gray-50)
   * - "compact" = smaller (min-h-[40vh], for guards/overlays)
   * - "inline" = section placeholder (py-24, no min-height)
   */
  variant?: "page" | "compact" | "inline";
  /** Use fixed inset-0 for full viewport overlay (e.g. editor) */
  fixed?: boolean;
}

const VARIANTS = {
  page: "min-h-screen bg-gray-50 flex items-center justify-center",
  compact: "min-h-[40vh] grid place-items-center",
  inline: "flex flex-col items-center justify-center py-24",
} as const;

export function PageLoader({
  message = "กำลังโหลด...",
  variant = "page",
  fixed = false,
}: PageLoaderProps): React.ReactElement {
  const baseClass = VARIANTS[variant];
  const wrapperClass = fixed
    ? "fixed inset-0 flex items-center justify-center bg-gray-50 z-50"
    : baseClass;

  return (
    <div className={wrapperClass}>
      <div className="text-center">
        <Loader2
          className="h-8 w-8 animate-spin text-lime-500 mx-auto mb-3"
          aria-hidden
        />
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}
