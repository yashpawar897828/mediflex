
import React from "react";
import { Pill } from "lucide-react";
import { PatientRecipient } from "@/types/distributors";

interface PatientDataDisplayProps {
  patientData: PatientRecipient | null;
}

const PatientDataDisplay = ({ patientData }: PatientDataDisplayProps) => {
  if (!patientData) return null;

  return (
    <div className="mt-4 border rounded-md p-4 bg-muted/20">
      <h3 className="font-medium mb-2">Patient & Medicines Information:</h3>
      <div className="mb-3">
        <div className="text-sm font-medium">Patient Name:</div>
        <div>{patientData.name || "Not detected"}</div>
        
        {patientData.contact && (
          <>
            <div className="text-sm font-medium mt-2">Contact:</div>
            <div>{patientData.contact}</div>
          </>
        )}
      </div>
      
      <h4 className="font-medium mt-4 mb-2">Medicines:</h4>
      {patientData.medicines.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {patientData.medicines.map((medicine, index) => (
            <div key={index} className="p-2 bg-background rounded-md border">
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Pill className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{medicine.name}</span>
                </div>
                <span>${medicine.price?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="grid grid-cols-2 text-sm text-muted-foreground">
                <div>Quantity: {medicine.quantity || 1}</div>
                {medicine.batch && <div>Batch: {medicine.batch}</div>}
              </div>
              {medicine.expiry && (
                <div className="text-sm text-muted-foreground">
                  Expiry: {new Date(medicine.expiry).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No medicines detected</p>
      )}
    </div>
  );
};

export default PatientDataDisplay;
