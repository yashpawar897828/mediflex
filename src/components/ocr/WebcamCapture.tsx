
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, StopCircle, Upload, ScanText } from "lucide-react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  isScanning: boolean;
  capturedImage: string | null;
  isProcessing: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapture: () => void;
  onClearImage: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const WebcamCapture = ({
  isScanning,
  capturedImage,
  isProcessing,
  onStartCamera,
  onStopCamera,
  onCapture,
  onClearImage,
  onFileUpload
}: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);

  // Expose webcam ref to parent through capture function
  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture();
    }
  };

  return (
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
            <Button onClick={onStopCamera} variant="destructive" size="sm">
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
            <Button onClick={onClearImage} variant="outline" size="sm">
              Clear Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <ScanText className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="flex flex-col gap-2 items-center">
            <Button onClick={onStartCamera}>
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
                  onChange={onFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
