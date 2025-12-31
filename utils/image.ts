
/**
 * Resizes and compresses an image file to ensure it is small enough for LocalStorage.
 * Max dimensions: 800x800
 * Quality: 0.7 (JPEG)
 */
export const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      compressImageElement(img).then(resolve).catch(reject);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Compresses a Base64 string directly. Useful for optimizing AI-generated images before storage.
 */
export const compressBase64 = (base64String: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
            compressImageElement(img).then(resolve).catch(reject);
        };
        img.onerror = (err) => reject(err);
    });
};

/**
 * Internal helper to handle canvas drawing and compression
 */
const compressImageElement = (img: HTMLImageElement): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500; // Slightly smaller for avatars to save space (LocalStorage is tight)
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Fill white background (for transparency issues when converting to JPEG)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Export as reduced quality JPEG
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        } else {
            reject(new Error("Canvas context not available"));
        }
    });
};
