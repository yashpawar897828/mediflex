
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";

interface ResultDisplayProps {
  text: string;
  isProcessing: boolean;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCopyText: () => void;
}

const ResultDisplay = ({
  text,
  isProcessing,
  onTextChange,
  onCopyText
}: ResultDisplayProps) => {
  return (
    <div className="relative">
      <Textarea
        value={text}
        onChange={onTextChange}
        placeholder="Extracted text will appear here..."
        className="min-h-32"
        disabled={isProcessing}
      />
      {text && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2"
          onClick={onCopyText}
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ResultDisplay;
