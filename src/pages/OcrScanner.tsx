import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanText, ArrowRight, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Import our components
import WebcamCapture from "@/components/ocr/WebcamCapture";
import ProcessingProgress from "@/components/ocr/ProcessingProgress";
import ResultDisplay from "@/components/ocr/ResultDisplay";
import ModeSelector from "@/components/ocr/ModeSelector";
import { useOcr } from "@/hooks/useOcr";
import { inventoryService, InventoryItem } from "@/services/InventoryService";
import { distributorService } from "@/services/DistributorService";
import { OrderReceiptData } from "@/types/distributors";

const OcrScanner = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve" | "order">("store");
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [productData, setProductData] = useState<Partial<InventoryItem> | null>(null);
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
        
        if (mode === "store") {
          // Parse the OCR text to extract product information
          const extractedData = inventoryService.parseOcrText(result);
          setProductData(extractedData);
          setOrderData(null);
          toast.success("Text extracted successfully! Review the data before saving.");
        } else if (mode === "order") {
          // Parse the OCR text as an order receipt
          const extractedOrderData = inventoryService.parseOrderReceipt(result);
          setOrderData(extractedOrderData);
          setProductData(null);
          
          if (extractedOrderData.products.length > 0) {
            toast.success(`Extracted ${extractedOrderData.products.length} products from receipt!`);
          } else {
            toast.info("Could not identify products in the receipt. Please check the scan quality.");
          }
        } else {
          // Search the inventory with the extracted text
          const results = inventoryService.searchInventory(result);
          setSearchResults(results);
          setProductData(null);
          setOrderData(null);
          
          if (results.length > 0) {
            toast.success(`Found ${results.length} matching products!`);
          } else {
            toast.info("No matching products found in inventory.");
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

  const handleSaveToInventory = () => {
    if (!productData) {
      toast.error("No product data to save");
      return;
    }
    
    // Ensure we have at least some basic data
    if (!productData.name || !productData.batch) {
      toast.error("Product must have at least a name and batch number");
      return;
    }
    
    try {
      const savedItem = inventoryService.saveItem({
        name: productData.name || "Unknown Product",
        batch: productData.batch || "UNKNOWN",
        expiry: productData.expiry || new Date().toISOString().split('T')[0],
        price: productData.price || 0,
        stock: productData.stock || 1
      });
      
      toast.success("Product saved to inventory!");
      setProductData(null);
      setText("");
      setCapturedImage(null);
      
      // Navigate to inventory page after short delay
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      console.error("Error saving to inventory:", error);
      toast.error("Failed to save product to inventory");
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
    setProductData(null);
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
            Scan documents to extract text or search for information
            {!isReady && <span className="ml-2 text-amber-500">(OCR engine initializing...)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode selector component */}
          <div className="flex space-x-2">
            <Button 
              variant={mode === "store" ? "default" : "outline"} 
              onClick={() => {
                setMode("store");
                setSearchResults([]);
                setProductData(null);
                setOrderData(null);
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              Single Product
            </Button>
            <Button 
              variant={mode === "order" ? "default" : "outline"} 
              onClick={() => {
                setMode("order");
                setSearchResults([]);
                setProductData(null);
                setOrderData(null);
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Order Receipt
            </Button>
            <Button 
              variant={mode === "retrieve" ? "default" : "outline"} 
              onClick={() => {
                setMode("retrieve");
                setSearchResults([]);
                setProductData(null);
                setOrderData(null);
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              Search
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

          {/* Search results display */}
          {mode === "retrieve" && searchResults.length > 0 && (
            <div className="mt-4 border rounded-md p-4 bg-muted/20">
              <h3 className="font-medium mb-2">Search Results:</h3>
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <div key={item.id} className="p-3 bg-background rounded-md border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Batch: {item.batch}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Stock: {item.stock}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Expiry: {new Date(item.expiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted product data display (in store mode) */}
          {mode === "store" && productData && (
            <div className="mt-4 border rounded-md p-4 bg-muted/20">
              <h3 className="font-medium mb-2">Extracted Product Information:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Product Name:</p>
                  <p>{productData.name || "Not detected"}</p>
                </div>
                <div>
                  <p className="font-medium">Batch Number:</p>
                  <p>{productData.batch || "Not detected"}</p>
                </div>
                <div>
                  <p className="font-medium">Expiry Date:</p>
                  <p>{productData.expiry ? new Date(productData.expiry).toLocaleDateString() : "Not detected"}</p>
                </div>
                <div>
                  <p className="font-medium">Price:</p>
                  <p>{productData.price ? `$${productData.price.toFixed(2)}` : "Not detected"}</p>
                </div>
              </div>
              <div className="mt-3 text-muted-foreground text-xs">
                <p>You can edit these details in the inventory after saving</p>
              </div>
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
                      <div className="text-sm text-muted-foreground">
                        Quantity: {product.quantity || 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No products detected in receipt</p>
              )}
              
              <div className="mt-3 text-muted-foreground text-xs">
                <p>Products will be added to both distributor records and inventory</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {mode === "store" && productData && (
              <Button onClick={handleSaveToInventory}>
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
                  : mode === "store" 
                    ? "Extract Data" 
                    : mode === "order" 
                      ? "Extract Order Data" 
                      : "Search Inventory"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OcrScanner;
