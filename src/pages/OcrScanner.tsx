
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import our components
import WebcamCapture from "@/components/ocr/WebcamCapture";
import ProcessingProgress from "@/components/ocr/ProcessingProgress";
import ResultDisplay from "@/components/ocr/ResultDisplay";
import PatientDataDisplay from "@/components/ocr/PatientDataDisplay";
import OrderReceiptDisplay from "@/components/ocr/OrderReceiptDisplay";
import OcrModeSelector from "@/components/ocr/OcrModeSelector";
import OcrActionButtons from "@/components/ocr/OcrActionButtons";
import { useOcrProcessor } from "@/hooks/useOcrProcessor";

const OcrScanner = () => {
  const {
    text,
    mode,
    isScanning,
    capturedImage,
    patientData,
    orderData,
    isProcessing,
    ocrProgress,
    isReady,
    handleCapture,
    handleProcessImage,
    handleStartCamera,
    handleStopCamera,
    handleFileUpload,
    handleCopyToClipboard,
    handleSavePatientMedicines,
    handleProcessOrderReceipt,
    handleTextChange,
    handleModeChange,
    setCapturedImage
  } = useOcrProcessor();

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
            Scan documents to extract text or process order receipts
            {!isReady && <span className="ml-2 text-amber-500">(OCR engine initializing...)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode selector component */}
          <OcrModeSelector 
            mode={mode} 
            setMode={handleModeChange} 
            isProcessing={isProcessing}
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
            onTextChange={handleTextChange}
            onCopyText={handleCopyToClipboard}
          />

          {/* Extracted patient data display (in patient mode) */}
          {mode === "patient" && (
            <PatientDataDisplay patientData={patientData} />
          )}

          {/* Extracted order receipt data display (in order mode) */}
          {mode === "order" && (
            <OrderReceiptDisplay orderData={orderData} />
          )}

          <OcrActionButtons
            mode={mode}
            isProcessing={isProcessing}
            isReady={isReady}
            hasImage={!!capturedImage}
            hasText={!!text}
            patientData={patientData}
            orderData={orderData}
            onProcessImage={handleProcessImage}
            onSavePatientMedicines={handleSavePatientMedicines}
            onProcessOrderReceipt={handleProcessOrderReceipt}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OcrScanner;
