
import React from "react";
import { Button } from "@/components/ui/button";
import { ScanText, ArrowRight } from "lucide-react";
import { PatientRecipient, OrderReceiptData } from "@/types/distributors";

interface OcrActionButtonsProps {
  mode: "patient" | "order";
  isProcessing: boolean;
  isReady: boolean;
  hasImage: boolean;
  hasText: boolean;
  patientData: PatientRecipient | null;
  orderData: OrderReceiptData | null;
  onProcessImage: () => void;
  onSavePatientMedicines: () => void;
  onProcessOrderReceipt: () => void;
}

const OcrActionButtons = ({
  mode,
  isProcessing,
  isReady,
  hasImage,
  hasText,
  patientData,
  orderData,
  onProcessImage,
  onSavePatientMedicines,
  onProcessOrderReceipt
}: OcrActionButtonsProps) => {
  return (
    <div className="flex justify-end gap-2">
      {mode === "patient" && patientData && patientData.medicines.length > 0 && (
        <Button onClick={onSavePatientMedicines}>
          Save to Inventory
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
      
      {mode === "order" && orderData && (
        <Button 
          onClick={onProcessOrderReceipt}
          disabled={orderData.products.length === 0}
        >
          Process Order Receipt
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
      
      <Button 
        onClick={onProcessImage} 
        disabled={isProcessing || (!hasImage && !hasText) || !isReady}
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
  );
};

export default OcrActionButtons;
