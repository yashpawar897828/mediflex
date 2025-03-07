
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Search } from "lucide-react";

interface ModeSelectorProps {
  mode: "store" | "retrieve";
  isProcessing: boolean;
  onModeChange: (mode: "store" | "retrieve") => void;
}

const ModeSelector = ({ mode, isProcessing, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={mode === "store" ? "default" : "outline"} 
        onClick={() => onModeChange("store")}
        className="flex-1"
        disabled={isProcessing}
      >
        <Save className="mr-2 h-4 w-4" />
        Store Data
      </Button>
      <Button 
        variant={mode === "retrieve" ? "default" : "outline"} 
        onClick={() => onModeChange("retrieve")}
        className="flex-1"
        disabled={isProcessing}
      >
        <Search className="mr-2 h-4 w-4" />
        Search Data
      </Button>
    </div>
  );
};

export default ModeSelector;
