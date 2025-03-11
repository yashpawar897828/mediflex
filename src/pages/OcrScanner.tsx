
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanText, ArrowRight, ClipboardList, UserRound, Pill } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Import our components
import WebcamCapture from "@/components/ocr/WebcamCapture";
import ProcessingProgress from "@/components/ocr/ProcessingProgress";
import ResultDisplay from "@/components/ocr/ResultDisplay";
import { useOcr } from "@/hooks/useOcr";
import { inventoryService, InventoryItem } from "@/services/InventoryService";
import { distributorService } from "@/services/DistributorService";
import { OrderReceiptData, PatientRecipient, Medicine } from "@/types/distributors";

const OcrScanner = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"patient" | "order">("patient");
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [patientData, setPatientData] = useState<PatientRecipient | null>(null);
  const [orderData, setOrderData] = useState<OrderReceiptData | null>(null);
  const { isProcessing, ocrProgress, processImage, isReady } = useOcr();
  const navigate = useNavigate();

  const handleCapture = () => {
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

    if (!isReady) {
      toast.error("OCR engine is still initializing. Please wait a moment and try again.");
      return;
    }

    if (capturedImage) {
      const result = await processImage(capturedImage);
      if (result) {
        setText(result);
        
        if (mode === "patient") {
          // Parse the OCR text to extract patient and medicine information
          const extractedData = inventoryService.parsePatientMedicines(result);
          setPatientData(extractedData);
          setOrderData(null);
          
          if (extractedData.medicines.length > 0) {
            toast.success(`Extracted ${extractedData.medicines.length} medicines for patient!`);
          } else {
            toast.info("Could not identify medicines in the document. Please check the scan quality.");
          }
        } else if (mode === "order") {
          // Parse the OCR text as an order receipt with enhanced fields
          const extractedOrderData = inventoryService.parseOrderReceipt(result);
          setOrderData(extractedOrderData);
          setPatientData(null);
          
          if (extractedOrderData.products.length > 0) {
            toast.success(`Extracted ${extractedOrderData.products.length} products from receipt!`);
          } else {
            toast.info("Could not identify products in the receipt. Please check the scan quality.");
          }
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

  const handleSavePatientMedicines = () => {
    if (!patientData) {
      toast.error("No patient data to save");
      return;
    }
    
    if (patientData.medicines.length === 0) {
      toast.error("No medicines found for patient");
      return;
    }
    
    try {
      // Save each medicine to inventory
      const savedItems = patientData.medicines.map(medicine => {
        return inventoryService.saveItem({
          name: medicine.name || "Unknown Medicine",
          batch: medicine.batch || "UNKNOWN",
          expiry: medicine.expiry || new Date().toISOString().split('T')[0],
          price: medicine.price || 0,
          stock: medicine.quantity || 1
        });
      });
      
      toast.success(`Saved ${savedItems.length} medicines to inventory!`);
      setPatientData(null);
      setText("");
      setCapturedImage(null);
      
      // Navigate to inventory page after short delay
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      console.error("Error saving to inventory:", error);
      toast.error("Failed to save medicines to inventory");
    }
  };

  const handleProcessOrderReceipt = () => {
    if (!orderData) {
      toast.error("No order data to process");
      return;
    }
    
    if (orderData.products.length === 0) {
      toast.error("No products found in the order receipt");
      return;
    }
    
    try {
      // First save to distributor
      const { success, distributorId } = distributorService.processOrderReceipt(orderData);
      
      if (success) {
        // Then add to inventory
        const addedItems = inventoryService.addOrderToInventory(orderData, distributorId);
        
        toast.success(`Added ${addedItems.length} products to inventory from order receipt!`);
        setOrderData(null);
        setText("");
        setCapturedImage(null);
        
        // Navigate to inventory page after short delay
        setTimeout(() => {
          navigate('/inventory');
        }, 1500);
      } else {
        toast.error("Failed to process order receipt");
      }
    } catch (error) {
      console.error("Error processing order receipt:", error);
      toast.error("Failed to process order receipt");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Clear previous results when text changes
    setSearchResults([]);
    setPatientData(null);
    setOrderData(null);
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
            Scan documents to extract text or process order receipts
            {!isReady && <span className="ml-2 text-amber-500">(OCR engine initializing...)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode selector component */}
          <div className="flex space-x-2">
            <Button 
              variant={mode === "patient" ? "default" : "outline"} 
              onClick={() => {
                setMode("patient");
                setPatientData(null);
                setOrderData(null);
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              <UserRound className="mr-2 h-4 w-4" />
              Patient Recipient
            </Button>
            <Button 
              variant={mode === "order" ? "default" : "outline"} 
              onClick={() => {
                setMode("order");
                setPatientData(null);
                setOrderData(null);
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Order Receipt
            </Button>
          </div>

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
          {mode === "patient" && patientData && (
            <div className="mt-4 border rounded-md p-4 bg-muted/20">
              <h3 className="font-medium mb-2">Patient & Medicines Information:</h3>
              <div className="mb-3">
                <div className="text-sm font-medium">Patient Name:</div>
                <div>{patientData.name || "Not detected"}</div>
                
                {patientData.contact && (
                  <>
                    <div className="text-sm font-medium mt-2">Contact:</div>
                    <div>{patientData.contact}</div>
                  </>
                )}
              </div>
              
              <h4 className="font-medium mt-4 mb-2">Medicines:</h4>
              {patientData.medicines.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {patientData.medicines.map((medicine, index) => (
                    <div key={index} className="p-2 bg-background rounded-md border">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Pill className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{medicine.name}</span>
                        </div>
                        <span>${medicine.price?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm text-muted-foreground">
                        <div>Quantity: {medicine.quantity || 1}</div>
                        {medicine.batch && <div>Batch: {medicine.batch}</div>}
                      </div>
                      {medicine.expiry && (
                        <div className="text-sm text-muted-foreground">
                          Expiry: {new Date(medicine.expiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No medicines detected</p>
              )}
            </div>
          )}

          {/* Extracted order receipt data display (in order mode) */}
          {mode === "order" && orderData && (
            <div className="mt-4 border rounded-md p-4 bg-muted/20">
              <h3 className="font-medium mb-2">Order Receipt Information:</h3>
              
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Distributor:</p>
                    <p>{orderData.distributorName || "Not detected"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Contact:</p>
                    <p>{orderData.distributorContact || "Not detected"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Receipt ID:</p>
                    <p>{orderData.receiptId || "Not detected"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Date:</p>
                    <p>{orderData.date ? new Date(orderData.date).toLocaleDateString() : "Not detected"}</p>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium mt-3 mb-2">Products:</h4>
              {orderData.products.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {orderData.products.map((product, index) => (
                    <div key={index} className="p-2 bg-background rounded-md border">
                      <div className="flex justify-between">
                        <span className="font-medium">{product.name}</span>
                        <span>${product.price?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm text-muted-foreground">
                        <div>Quantity: {product.quantity || 1}</div>
                        {product.batch && <div>Batch: {product.batch}</div>}
                      </div>
                      {product.expiry && (
                        <div className="text-sm text-muted-foreground">
                          Expiry: {new Date(product.expiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No products detected in receipt</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {mode === "patient" && patientData && patientData.medicines.length > 0 && (
              <Button onClick={handleSavePatientMedicines}>
                Save to Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {mode === "order" && orderData && (
              <Button 
                onClick={handleProcessOrderReceipt}
                disabled={orderData.products.length === 0}
              >
                Process Order Receipt
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            <Button 
              onClick={handleProcessImage} 
              disabled={isProcessing || (!capturedImage && !text) || !isReady}
            >
              <ScanText className="mr-2 h-4 w-4" />
              {isProcessing 
                ? "Processing..." 
                : !isReady
                  ? "Initializing OCR..." 
                  : mode === "patient" 
                    ? "Extract Patient Data" 
                    : "Extract Order Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OcrScanner;
