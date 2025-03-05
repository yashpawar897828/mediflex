
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Barcode, Search, Save, Camera, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve">("store");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => console.error("Error stopping scanner:", error));
      }
    };
  }, []);

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

  const handleScan = () => {
    if (!barcode.trim()) {
      toast.error("Please enter or scan a barcode");
      return;
    }
    
    // In a real implementation, this would connect to a backend API
    if (mode === "store") {
      toast.success("Barcode data stored successfully");
    } else {
      toast.success("Product information retrieved");
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
              onClick={() => setMode("store")}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Store Data
            </Button>
            <Button 
              variant={mode === "retrieve" ? "default" : "outline"} 
              onClick={() => setMode("retrieve")}
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
            <Button onClick={handleScan}>
              <Barcode className="mr-2 h-4 w-4" />
              {mode === "store" ? "Store" : "Retrieve"}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
