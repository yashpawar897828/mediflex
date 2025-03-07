
import { useState, useRef, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { toast } from "sonner";

export const useOcr = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  // Use any type to avoid TypeScript errors with the Tesseract API
  const workerRef = useRef<any>(null);

  // Initialize Tesseract worker
  useEffect(() => {
    const initWorker = async () => {
      try {
        // Create worker
        workerRef.current = await createWorker();
        
        // Set up progress logger separately after worker creation
        workerRef.current.setLogger((m: any) => {
          if (m.status === "recognizing text") {
            setOcrProgress(m.progress * 100);
          }
        });
        
        // Initialize worker with English language
        await workerRef.current.loadLanguage("eng");
        await workerRef.current.initialize("eng");
        
        console.log("OCR worker initialized successfully");
      } catch (error) {
        console.error("Failed to initialize OCR worker:", error);
        toast.error("Failed to initialize OCR engine. Please try again.");
      }
    };

    initWorker();

    // Cleanup worker on component unmount
    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch (error) {
          console.error("Error terminating OCR worker:", error);
        }
      }
    };
  }, []);

  const processImage = async (imageData: string) => {
    if (!workerRef.current) {
      toast.error("OCR engine is not ready yet. Please try again in a moment.");
      return null;
    }

    setIsProcessing(true);
    try {
      const result = await workerRef.current.recognize(imageData);
      return result.data.text;
    } catch (error) {
      console.error("OCR processing error:", error);
      toast.error("Error processing image. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  return {
    isProcessing,
    ocrProgress,
    processImage
  };
};
