
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScanText, Save, Search, Upload } from "lucide-react";

const OcrScanner = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"store" | "retrieve">("store");

  const handleScan = () => {
    // This is a placeholder. In a real app, we would use an OCR library
    console.log(`OCR scanning in ${mode} mode`);
    
    // In a real implementation, this would connect to a backend API
    if (mode === "store") {
      console.log("Storing OCR data in database...");
      // Logic to store data
    } else {
      console.log("Retrieving data via OCR...");
      // Logic to retrieve data
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
              Search Data
            </Button>
          </div>

          <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ScanText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                Camera feed for document scanning would appear here
              </p>
              <p className="text-xs text-gray-400">
                (Actual OCR implementation requires camera access and an OCR library)
              </p>
              <Button variant="outline" className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Extracted text will appear here..."
            className="min-h-32"
          />

          <div className="flex justify-end">
            <Button onClick={handleScan}>
              <ScanText className="mr-2 h-4 w-4" />
              {mode === "store" ? "Process & Store" : "Search Database"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OcrScanner;
