import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2, UserRound } from 'lucide-react';
import { tokenStorage } from '../../contexts/user.storage';
import { cn } from '../../utils/dashboard.utils';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Simple in-memory cache so the same URL
// doesn't get fetched repeatedly during the session.
const imageCache = new Map<string, string>();

/**
 * Image component that fetches images through axios with authentication headers
 * Converts the response to a blob URL for display
 */
export default function AuthenticatedImage({
  src,
  alt,
  className,
  fallback,
  onLoad,
  onError,
}: AuthenticatedImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep callbacks in refs so changing parent functions
  // does not retrigger the network request.
  const onLoadRef = useRef<typeof onLoad>(onLoad);
  const onErrorRef = useRef<typeof onError>(onError);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    // Serve from cache if we already fetched this URL
    const cached = imageCache.get(src);
    if (cached) {
      setBlobUrl(cached);
      setError(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);


        // Fetch image through axios (includes auth headers)
        // Use plain axios if possible to avoid instance-level withCredentials setting
        // that can conflict with some CORS configurations.
        const token = tokenStorage.get();
        const response = await axios.get(src, {
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: false,
        });

        if (!isMounted) return;

        // Create object URL from blob
        objectUrl = URL.createObjectURL(response.data);
        imageCache.set(src, objectUrl);
        setBlobUrl(objectUrl);
        onLoadRef.current?.();
      } catch (err) {
        if (!isMounted) return;

        const error = err instanceof Error ? err : new Error('Failed to load image');
        setError(error);
        onErrorRef.current?.(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    // Cleanup: mark unmounted. We intentionally do NOT revoke
    // cached object URLs so they can be reused across mounts.
    return () => {
      isMounted = false;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center bg-neutral-50/50", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-lime-500/50" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return fallback ? <>{fallback}</> : (
      <div className={cn("flex items-center justify-center bg-neutral-100", className)}>
        <UserRound className="w-1/2 h-1/2 text-neutral-400" />
      </div>
    );
  }

  return <img src={blobUrl} alt={alt} className={className} />;
}
