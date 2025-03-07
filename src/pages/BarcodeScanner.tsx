
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Barcode, Search, Save, Camera, StopCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { inventoryService, InventoryItem } from "@/services/InventoryService";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve">("store");
  const [scanning, setScanning] = useState(false);
  const [searchResult, setSearchResult] = useState<InventoryItem | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<InventoryItem, 'id'>>({
    name: "",
    expiry: new Date().toISOString().split('T')[0],
    batch: "",
    price: 0,
    stock: 1
  });
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => console.error("Error stopping scanner:", error));
      }
    };
  }, []);

  // When barcode changes, populate the batch field
  useEffect(() => {
    if (barcode && mode === "store") {
      setNewProduct(prev => ({
        ...prev,
        batch: barcode
      }));
    } else if (barcode && mode === "retrieve") {
      handleSearch();
    }
  }, [barcode]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
      
      setScanning(true);
      toast.success("Camera started successfully");
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Failed to start camera. Please check camera permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
        toast.info("Scanner stopped");
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    setBarcode(decodedText);
    stopScanner();
    toast.success(`Barcode detected: ${decodedText}`);
  };

  const onScanFailure = (error: any) => {
    // Silent failure - no need to show errors during scanning attempts
    console.debug("QR scan error:", error);
  };

  const handleManualEntry = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSearch = () => {
    if (!barcode.trim()) {
      toast.error("Please enter or scan a barcode");
      return;
    }
    
    const result = inventoryService.findByBarcode(barcode);
    setSearchResult(result);
    
    if (result) {
      toast.success("Product found in inventory!");
    } else {
      toast.info("No product found with this barcode");
    }
  };

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.batch) {
      toast.error("Product name and batch number are required");
      return;
    }
    
    try {
      const savedItem = inventoryService.saveItem(newProduct);
      toast.success("Product saved to inventory successfully!");
      
      // Reset form
      setBarcode("");
      setNewProduct({
        name: "",
        expiry: new Date().toISOString().split('T')[0],
        batch: "",
        price: 0,
        stock: 1
      });
      
      // Navigate to inventory after delay
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Barcode Scanner</h1>
        <p className="text-muted-foreground">Scan and manage products with barcodes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Barcode</CardTitle>
          <CardDescription>
            Scan a barcode to store or retrieve product information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant={mode === "store" ? "default" : "outline"} 
              onClick={() => {
                setMode("store");
                setSearchResult(null);
              }}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Store Data
            </Button>
            <Button 
              variant={mode === "retrieve" ? "default" : "outline"} 
              onClick={() => {
                setMode("retrieve");
                setSearchResult(null);
              }}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Retrieve Data
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              value={barcode}
              onChange={handleManualEntry}
              placeholder="Enter barcode manually or scan"
              className="flex-1"
            />
            <Button onClick={mode === "retrieve" ? handleSearch : undefined}>
              <Barcode className="mr-2 h-4 w-4" />
              {mode === "store" ? "Use Barcode" : "Search"}
            </Button>
          </div>

          <div className="relative min-h-64 border rounded-lg">
            {scanning ? (
              <div className="absolute top-2 right-2 z-10">
                <Button variant="destructive" size="sm" onClick={stopScanner}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {!scanning && (
                  <Button onClick={startScanner}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                )}
              </div>
            )}
            <div id={scannerContainerId} className="w-full h-64" />
          </div>
          
          {barcode && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-1">Detected Barcode:</h3>
              <p className="font-mono bg-background p-2 rounded border">{barcode}</p>
            </div>
          )}

          {/* Display search result when in retrieve mode */}
          {mode === "retrieve" && searchResult && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium mb-2">Product Information:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium">{searchResult.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-medium">{searchResult.batch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">{new Date(searchResult.expiry).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">${searchResult.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium">{searchResult.stock} units</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={() => navigate('/inventory')}>
                  View in Inventory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Show product form when in store mode */}
          {mode === "store" && barcode && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium mb-2">Add Product Details:</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="product-name" className="text-sm">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="product-name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleProductInputChange}
                    placeholder="Enter product name"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="product-batch" className="text-sm">
                      Batch Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="product-batch"
                      name="batch"
                      value={newProduct.batch}
                      onChange={handleProductInputChange}
                      placeholder="Barcode/Batch"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-expiry" className="text-sm">
                      Expiry Date
                    </label>
                    <Input
                      id="product-expiry"
                      name="expiry"
                      type="date"
                      value={newProduct.expiry}
                      onChange={handleProductInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="product-price" className="text-sm">
                      Price
                    </label>
                    <Input
                      id="product-price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleProductInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-stock" className="text-sm">
                      Stock Quantity
                    </label>
                    <Input
                      id="product-stock"
                      name="stock"
                      type="number"
                      min="1"
                      value={newProduct.stock}
                      onChange={handleProductInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-2">
                  <Button onClick={handleSaveProduct}>
                    Save to Inventory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
