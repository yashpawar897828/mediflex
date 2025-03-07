
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanText } from "lucide-react";
import { toast } from "sonner";

// Import our new components
import WebcamCapture from "@/components/ocr/WebcamCapture";
import ProcessingProgress from "@/components/ocr/ProcessingProgress";
import ResultDisplay from "@/components/ocr/ResultDisplay";
import ModeSelector from "@/components/ocr/ModeSelector";
import { useOcr } from "@/hooks/useOcr";

const OcrScanner = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve">("store");
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { isProcessing, ocrProgress, processImage } = useOcr();

  const handleCapture = () => {
    // This is now handled in the WebcamCapture component
    // The component will get the screenshot and pass it back
    const imageSrc = document.getElementById('webcam')?.querySelector('video')?.src;
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

    if (capturedImage) {
      const result = await processImage(capturedImage);
      if (result) {
        setText(result);
        
        if (mode === "store") {
          // In a real application, this would store data in a database
          toast.success("Text extracted and stored successfully!");
        } else {
          // In a real application, this would search the database
          toast.success("Text extracted for search!");
        }
      }
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
          {/* Mode selector component */}
          <ModeSelector 
            mode={mode} 
            isProcessing={isProcessing} 
            onModeChange={(newMode) => setMode(newMode)} 
          />

          {/* Webcam capture component */}
          <WebcamCapture
            isScanning={isScanning}
            capturedImage={capturedImage}
            isProcessing={isProcessing}
            onStartCamera={handleStartCamera}
            onStopCamera={handleStopCamera}
            onCapture={handleCapture}
            onClearImage={() => setCapturedImage(null)}
            onFileUpload={handleFileUpload}
          />

          {/* Progress indicator component */}
          <ProcessingProgress 
            isProcessing={isProcessing} 
            ocrProgress={ocrProgress} 
          />

          {/* Text result display component */}
          <ResultDisplay
            text={text}
            isProcessing={isProcessing}
            onTextChange={(e) => setText(e.target.value)}
            onCopyText={handleCopyToClipboard}
          />

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
