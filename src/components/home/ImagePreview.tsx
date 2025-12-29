import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ImagePreviewProps {
  filePath: string;
  alt?: string;
}

// Simple in-memory cache for loaded images
const imageCache = new Map<string, string>();

const ImagePreview: React.FC<ImagePreviewProps> = ({
  filePath,
  alt = "Image preview",
}) => {
  const [base64Image, setBase64Image] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const cached = imageCache.get(filePath);
        if (cached) {
          setBase64Image(cached);
          setLoading(false);
          return;
        }

        const result = await invoke<string>("get_image_base64", { filePath });

        imageCache.set(filePath, result);
        setBase64Image(result);
      } catch (err) {
        console.error("Failed to load image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded bg-secondary/20">
        <span className="text-xs text-secondary">...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded bg-secondary/20">
        <span className="text-xs text-secondary">Error</span>
      </div>
    );
  }

  return (
    <img
      src={base64Image}
      alt={alt}
      className="h-16 w-16 rounded object-cover"
    />
  );
};

export default ImagePreview;
