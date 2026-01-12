/**
 * Compresses and resizes an image file to a base64 string
 * suitable for LocalStorage (aiming for < 500kb)
 */
export const optimizeImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                // Convert to JPEG with reduced quality for better compression
                // or PNG if transparency is needed (but PNGs are larger)
                // We'll use PNG if the original was PNG to preserve transparency, but scale it down
                const fileType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                const outputQuality = file.type === 'image/png' ? undefined : quality; // PNG doesn't support quality param in toDataURL

                resolve(canvas.toDataURL(fileType, outputQuality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
