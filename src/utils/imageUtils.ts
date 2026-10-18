export interface ProcessedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
  dataUrl?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

/**
 * Resizes and compresses an image file to safe bounds (<8MB, max dimension)
 * and returns clean base64 data for the Gemini API.
 */
export async function processImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.8
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

        resolve({
          base64,
          mimeType,
          previewUrl: dataUrl,
          dataUrl,
          width,
          height,
          sizeBytes: Math.round((base64.length * 3) / 4),
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Fetches an image URL (e.g. Unsplash sample preset) and converts to ProcessedImage base64.
 */
export async function fetchSampleAsBase64(url: string): Promise<ProcessedImage> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const file = new File([blob], 'sample.jpg', { type: blob.type || 'image/jpeg' });
    return await processImageFile(file, 1024, 0.8);
  } catch {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Waste Item', 320, 240);
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    return {
      base64,
      mimeType: 'image/jpeg',
      previewUrl: dataUrl,
      dataUrl,
      width: 640,
      height: 480,
      sizeBytes: Math.round((base64.length * 3) / 4),
    };
  }
}
