
import { useState, useRef, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { toast } from "sonner";

export const useOcr = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  // Use any type to avoid TypeScript errors with the Tesseract API
  const workerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Tesseract worker
  useEffect(() => {
    let isMounted = true;

    const initWorker = async () => {
      try {
        // Clear any existing worker
        if (workerRef.current) {
          await workerRef.current.terminate();
        }
        
        // Create worker with progress handler in the options
        workerRef.current = await createWorker({
          logger: m => {
            if (m.status === "recognizing text" && isMounted) {
              setOcrProgress(m.progress * 100);
            }
          }
        });
        
        // Initialize worker language
        await workerRef.current.loadLanguage('eng');
        await workerRef.current.initialize('eng');
        
        if (isMounted) {
          setIsReady(true);
          console.log("OCR worker initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize OCR worker:", error);
        if (isMounted) {
          toast.error("Failed to initialize OCR engine. Please try again.");
        }
      }
    };

    initWorker();

    // Cleanup worker on component unmount
    return () => {
      isMounted = false;
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
    if (!workerRef.current || !isReady) {
      toast.error("OCR engine is not ready yet. Please try again in a moment.");
      return null;
    }

    setIsProcessing(true);
    setOcrProgress(0);
    
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
    processImage,
    isReady
  };
};
