
import React from "react";
import { Button } from "@/components/ui/button";
import { UserRound, ClipboardList } from "lucide-react";

interface OcrModeSelectorProps {
  mode: "patient" | "order";
  setMode: (mode: "patient" | "order") => void;
  isProcessing: boolean;
}

const OcrModeSelector = ({ mode, setMode, isProcessing }: OcrModeSelectorProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={mode === "patient" ? "default" : "outline"} 
        onClick={() => setMode("patient")}
        disabled={isProcessing}
        className="flex-1"
      >
        <UserRound className="mr-2 h-4 w-4" />
        Patient Recipient
      </Button>
      <Button 
        variant={mode === "order" ? "default" : "outline"} 
        onClick={() => setMode("order")}
        disabled={isProcessing}
        className="flex-1"
      >
        <ClipboardList className="mr-2 h-4 w-4" />
        Order Receipt
      </Button>
    </div>
  );
};

export default OcrModeSelector;
