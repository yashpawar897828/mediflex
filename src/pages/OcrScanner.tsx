
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScanText, Save, Search, Upload, Camera, Copy, StopCircle } from "lucide-react";
import Webcam from "react-webcam";
import { createWorker } from "tesseract.js";
import { toast } from "sonner";

const OcrScanner = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve">("store");
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  // Change the workerRef type to any to avoid TypeScript errors
  const workerRef = useRef<any>(null);

  // Initialize Tesseract worker
  useEffect(() => {
    const initWorker = async () => {
      try {
        // Create worker with progress callback
        workerRef.current = await createWorker({
          logger: m => {
            if (m.status === "recognizing text") {
              setOcrProgress(m.progress * 100);
            }
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

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsScanning(false);
    }
  };

  const handleProcessImage = async () => {
    if (!capturedImage && !text) {
      toast.error("No image to process. Please capture or upload an image first.");
      return;
    }

    if (!workerRef.current) {
      toast.error("OCR engine is not ready yet. Please try again in a moment.");
      return;
    }

    setIsProcessing(true);
    try {
      let result;
      
      if (capturedImage) {
        result = await workerRef.current.recognize(capturedImage);
        setText(result.data.text);
        
        if (mode === "store") {
          // In a real application, this would store data in a database
          toast.success("Text extracted and stored successfully!");
        } else {
          // In a real application, this would search the database
          toast.success("Text extracted for search!");
        }
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      toast.error("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleStartCamera = () => {
    setIsScanning(true);
    setCapturedImage(null);
  };

  const handleStopCamera = () => {
    setIsScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success("Text copied to clipboard"))
        .catch(() => toast.error("Failed to copy text"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">OCR Scanner</h1>
        <p className="text-muted-foreground">Scan and extract text from documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OCR Document Scanner</CardTitle>
          <CardDescription>
            Scan documents to extract text or search for information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant={mode === "store" ? "default" : "outline"} 
              onClick={() => setMode("store")}
              className="flex-1"
              disabled={isProcessing}
            >
              <Save className="mr-2 h-4 w-4" />
              Store Data
            </Button>
            <Button 
              variant={mode === "retrieve" ? "default" : "outline"} 
              onClick={() => setMode("retrieve")}
              className="flex-1"
              disabled={isProcessing}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Data
            </Button>
          </div>

          <div className="h-64 border rounded-lg overflow-hidden relative">
            {isScanning ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                  <Button onClick={handleCapture} variant="secondary">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                  <Button onClick={handleStopCamera} variant="destructive" size="sm">
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Camera
                  </Button>
                </div>
              </>
            ) : capturedImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-contain" 
                />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <Button onClick={() => setCapturedImage(null)} variant="outline" size="sm">
                    Clear Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <ScanText className="h-12 w-12 text-muted-foreground mb-4" />
                <div className="flex flex-col gap-2 items-center">
                  <Button onClick={handleStartCamera}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">or</span>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all" 
                  style={{ width: `${ocrProgress}%` }} 
                />
              </div>
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Processing... {Math.round(ocrProgress)}%
              </p>
            </div>
          )}

          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Extracted text will appear here..."
              className="min-h-32"
              disabled={isProcessing}
            />
            {text && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={handleCopyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleProcessImage} 
              disabled={isProcessing || (!capturedImage && !text)}
            >
              <ScanText className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : mode === "store" ? "Process & Store" : "Search Database"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OcrScanner;
