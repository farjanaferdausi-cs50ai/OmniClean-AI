/**
 * Client-side image handling, compression, and validation.
 * Enforces OWASP A03 / LLM02 input validation standards (max 8MB, client-side downscaling).
 */

export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export interface ProcessedImage {
  base64: string;
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export async function processImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<ProcessedImage> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`This image is ${sizeInMb} MB, which exceeds our 8 MB upload limit. Please take or select a slightly smaller photo.`);
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
  const hasValidExt = file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i);
  if (!validTypes.includes(file.type.toLowerCase()) && !hasValidExt) {
    throw new Error(`We couldn't recognize "${file.name || 'this file'}" as an image. Please upload a standard photo (JPEG, PNG, or WebP).`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('We had trouble reading your photo file. Please try selecting it again.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to decode this image format. Please try another photo.'));
      img.onload = () => {
        let { width, height } = img;

        // Downscale to max 1280px while maintaining original aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Browser canvas is unavailable for image compression.'));
          return;
        }

        // Render to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.8 quality
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

        resolve({
          base64,
          dataUrl,
          mimeType,
          width,
          height,
          fileSizeBytes: Math.round((base64.length * 3) / 4),
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Loads a remote sample image and converts it into a base64 payload.
 */
export async function fetchSampleAsBase64(url: string): Promise<ProcessedImage> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load sample image (HTTP ${response.status})`);
  }
  const blob = await response.blob();
  const file = new File([blob], 'sample.jpg', { type: blob.type || 'image/jpeg' });
  return processImageFile(file);
}
