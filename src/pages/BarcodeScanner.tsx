
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Barcode, Search, Save } from "lucide-react";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve">("store");

  const handleScan = () => {
    // This is a placeholder. In a real app, we would use a barcode scanning library
    // For now, we'll just use the manually entered barcode
    console.log(`Scanning barcode: ${barcode} in ${mode} mode`);
    
    // In a real implementation, this would connect to a backend API
    if (mode === "store") {
      console.log("Storing barcode data in database...");
      // Logic to store data
    } else {
      console.log("Retrieving data for barcode...");
      // Logic to retrieve data
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
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode manually or scan"
              className="flex-1"
            />
            <Button onClick={handleScan}>
              <Barcode className="mr-2 h-4 w-4" />
              {mode === "store" ? "Store" : "Retrieve"}
            </Button>
          </div>

          <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Barcode className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                Camera feed for barcode scanning would appear here
              </p>
              <p className="text-xs text-gray-400">
                (Actual scanner implementation requires camera access and a barcode scanning library)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
