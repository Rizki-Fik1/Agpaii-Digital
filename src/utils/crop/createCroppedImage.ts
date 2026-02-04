import { compressImageToTargetSize } from "../imageCompression";

export async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        
        // Buat file sementara dari hasil crop (kualitas awal tinggi agar tidak double compression artifact)
        const file = new File([blob], "cropped.jpeg", {
          type: "image/jpeg",
        });

        try {
          // Kompres file tersebut ke target size menggunakan utility baru
          const compressedFile = await compressImageToTargetSize(file);
          resolve(compressedFile);
        } catch (error) {
          // Fallback jika kompresi gagal (kembalikan file crop original)
          console.error("Compression failed in createCroppedImage", error);
          resolve(file);
        }
      },
      "image/jpeg",
      1.0 // Mulai dengan kualitas tinggi sebelum dikompres ulang
    );
  });
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}
