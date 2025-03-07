
import React from "react";

interface ProcessingProgressProps {
  isProcessing: boolean;
  ocrProgress: number;
}

const ProcessingProgress = ({ isProcessing, ocrProgress }: ProcessingProgressProps) => {
  if (!isProcessing) return null;

  return (
    <div className="mt-2">
      <div className="w-full bg-muted rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all" 
          style={{ width: `${ocrProgress}%` }} 
        />
      </div>
      <p className="text-xs text-center mt-1 text-muted-foreground">
        Processing... {Math.round(ocrProgress)}%
      </p>
    </div>
  );
};

export default ProcessingProgress;
