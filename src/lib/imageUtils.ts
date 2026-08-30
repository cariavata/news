/**
 * Compresses an image file into a lightweight JPEG data URL or uploads it.
 * Uses high-performance HTML5 Canvas scaling to avoid Firestore & localStorage document size bloat.
 * Supports both Promise-based (await compressImage(file)) and callback-based usage.
 */
export const compressImage = (
  file: File,
  maxWidth: number = 900,
  maxHeight: number = 900,
  qualityOrCallback: number | ((base64: string) => void) = 0.7,
  callback?: (base64: string) => void
): Promise<string> => {
  const quality = typeof qualityOrCallback === 'number' ? qualityOrCallback : 0.7;
  const cb = typeof qualityOrCallback === 'function' ? qualityOrCallback : callback;

  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      if (cb) cb('');
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            if (cb) cb(dataUrl);
            resolve(dataUrl);
          } else {
            const raw = (event.target?.result as string) || '';
            if (cb) cb(raw);
            resolve(raw);
          }
        } catch (e) {
          console.warn("Canvas compression failed, falling back to raw data URL:", e);
          const raw = (event.target?.result as string) || '';
          if (cb) cb(raw);
          resolve(raw);
        }
      };
      img.onerror = () => {
        if (cb) cb('');
        resolve('');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      if (cb) cb('');
      resolve('');
    };
    reader.readAsDataURL(file);
  });
};
