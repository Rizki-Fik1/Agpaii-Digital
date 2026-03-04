/**
 * Utility to compress images to a target file size (150KB - 250KB).
 */

export async function compressImageToTargetSize(
  file: File,
  targetMinSizeKB: number = 150,
  targetMaxSizeKB: number = 250
): Promise<File> {
  const targetMinSizeBytes = targetMinSizeKB * 1024;
  const targetMaxSizeBytes = targetMaxSizeKB * 1024;

  // Helper to get Blob size at specific quality
  const getBlobAtQuality = (
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    });
  };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 1. Initial Resize (Constraint excessive dimensions)
        // Maintaining 1280px max dimension as a good baseline for web photos
        let width = img.width;
        let height = img.height;
        const maxSize = 1280;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // 2. Binary Search for Quality
        let minQuality = 0.0;
        let maxQuality = 1.0;
        let bestBlob: Blob | null = null;
        
        // Iterations to find best fit
        for (let i = 0; i < 10; i++) {
            const midQuality = (minQuality + maxQuality) / 2;
            const blob = await getBlobAtQuality(canvas, midQuality);
            
            if (!blob) break;

            if (blob.size >= targetMinSizeBytes && blob.size <= targetMaxSizeBytes) {
                // Found within range!
                bestBlob = blob;
                break;
            } else if (blob.size > targetMaxSizeBytes) {
                // Too big, reduce quality
                maxQuality = midQuality;
            } else {
                // Too small, increase quality
                minQuality = midQuality;
                // Keep this as "best so far" if we don't find a perfect match
                // but preferably we want higher quality if possible
                if (!bestBlob || blob.size > bestBlob.size) { 
                    bestBlob = blob;
                }
            }
        }

        // Fallback checks
        if (!bestBlob) {
             // Try max quality if nothing found (should rely on loop results though)
             bestBlob = await getBlobAtQuality(canvas, 0.9);
        } else {
             // One final check: if even at lowest quality it's too big, 
             // we might accept it or try to resize further. 
             // For now, let's respect the quality loop result which tries its best.
             // If manual loop finished, check if we can get closer if we are under size
             if (bestBlob.size < targetMinSizeBytes) {
                 // Try max quality to see if we can reach min size
                 const maxBlob = await getBlobAtQuality(canvas, 0.95);
                 if (maxBlob && maxBlob.size <= targetMaxSizeBytes) {
                     bestBlob = maxBlob;
                 }
             }
        }
        
        if (bestBlob) {
             resolve(
            new File([bestBlob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        } else {
             reject(new Error("Compression failed"));
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
