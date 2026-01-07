"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path - using CDN for compatibility
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFThumbnailResult {
  dataUrl: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to generate a thumbnail from the first page of a PDF
 * @param pdfSource - Can be a URL string, File object, or ArrayBuffer
 * @param scale - Scale factor for the thumbnail (default 1.5)
 * @returns Object containing dataUrl, loading state, and error
 */
export function usePDFThumbnail(
  pdfSource: string | File | ArrayBuffer | null,
  scale: number = 1.5
): PDFThumbnailResult {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfSource) {
      setDataUrl(null);
      return;
    }

    let isCancelled = false;

    const generateThumbnail = async () => {
      setLoading(true);
      setError(null);

      try {
        let pdfData: string | ArrayBuffer | Uint8Array;

        // Handle different source types
        if (pdfSource instanceof File) {
          pdfData = await pdfSource.arrayBuffer();
        } else if (pdfSource instanceof ArrayBuffer) {
          pdfData = pdfSource;
        } else {
          pdfData = pdfSource; // URL string
        }

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(pdfData);
        const pdf = await loadingTask.promise;

        // Get first page
        const page = await pdf.getPage(1);

        // Set up canvas
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        if (!isCancelled) {
          // Convert canvas to data URL
          const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setDataUrl(thumbnailDataUrl);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error generating PDF thumbnail:", err);
          setError(
            err instanceof Error ? err.message : "Failed to generate thumbnail"
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [pdfSource, scale]);

  return { dataUrl, loading, error };
}

/**
 * Generate a thumbnail from a PDF file synchronously (returns a promise)
 * Useful for form submissions where you need the thumbnail before uploading
 * @param pdfFile - PDF File object
 * @param scale - Scale factor for the thumbnail (default 1.5)
 * @returns Promise containing the data URL string
 */
export async function generatePDFThumbnail(
  pdfFile: File,
  scale: number = 1.5
): Promise<string> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not get canvas context");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return canvas.toDataURL("image/jpeg", 0.8);
  } catch (err) {
    console.error("Error generating PDF thumbnail:", err);
    throw err;
  }
}
