
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOcr } from "@/hooks/useOcr";
import { inventoryService } from "@/services/InventoryService";
import { distributorService } from "@/services/DistributorService";
import { OrderReceiptData, PatientRecipient } from "@/types/distributors";

export const useOcrProcessor = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"patient" | "order">("patient");
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientRecipient | null>(null);
  const [orderData, setOrderData] = useState<OrderReceiptData | null>(null);
  const { isProcessing, ocrProgress, processImage, isReady } = useOcr();
  const navigate = useNavigate();

  const handleCapture = () => {
    const imageSrc = document.getElementById('webcam')?.querySelector('video')?.src;
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsScanning(false);
    }
  };

  const handleProcessImage = async () => {
    if (!capturedImage && !text) {
      toast.error("No image to process. Please capture or upload an image first.");
      return;
    }

    if (!isReady) {
      toast.error("OCR engine is still initializing. Please wait a moment and try again.");
      return;
    }

    if (capturedImage) {
      const result = await processImage(capturedImage);
      if (result) {
        setText(result);
        
        if (mode === "patient") {
          // Parse the OCR text to extract patient and medicine information
          const extractedData = inventoryService.parsePatientMedicines(result);
          setPatientData(extractedData);
          setOrderData(null);
          
          if (extractedData.medicines.length > 0) {
            toast.success(`Extracted ${extractedData.medicines.length} medicines for patient!`);
          } else {
            toast.info("Could not identify medicines in the document. Please check the scan quality.");
          }
        } else if (mode === "order") {
          // Parse the OCR text as an order receipt with enhanced fields
          const extractedOrderData = inventoryService.parseOrderReceipt(result);
          setOrderData(extractedOrderData);
          setPatientData(null);
          
          if (extractedOrderData.products.length > 0) {
            toast.success(`Extracted ${extractedOrderData.products.length} products from receipt!`);
          } else {
            toast.info("Could not identify products in the receipt. Please check the scan quality.");
          }
        }
      }
    }
  };

  const handleStartCamera = () => {
    setIsScanning(true);
    setCapturedImage(null);
  };

  const handleStopCamera = () => {
    setIsScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success("Text copied to clipboard"))
        .catch(() => toast.error("Failed to copy text"));
    }
  };

  const handleSavePatientMedicines = () => {
    if (!patientData) {
      toast.error("No patient data to save");
      return;
    }
    
    if (patientData.medicines.length === 0) {
      toast.error("No medicines found for patient");
      return;
    }
    
    try {
      // Save each medicine to inventory
      const savedItems = patientData.medicines.map(medicine => {
        return inventoryService.saveItem({
          name: medicine.name || "Unknown Medicine",
          batch: medicine.batch || "UNKNOWN",
          expiry: medicine.expiry || new Date().toISOString().split('T')[0],
          price: medicine.price || 0,
          stock: medicine.quantity || 1
        });
      });
      
      toast.success(`Saved ${savedItems.length} medicines to inventory!`);
      setPatientData(null);
      setText("");
      setCapturedImage(null);
      
      // Navigate to inventory page after short delay
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      console.error("Error saving to inventory:", error);
      toast.error("Failed to save medicines to inventory");
    }
  };

  const handleProcessOrderReceipt = () => {
    if (!orderData) {
      toast.error("No order data to process");
      return;
    }
    
    if (orderData.products.length === 0) {
      toast.error("No products found in the order receipt");
      return;
    }
    
    try {
      // First save to distributor
      const { success, distributorId } = distributorService.processOrderReceipt(orderData);
      
      if (success) {
        // Then add to inventory
        const addedItems = inventoryService.addOrderToInventory(orderData, distributorId);
        
        toast.success(`Added ${addedItems.length} products to inventory from order receipt!`);
        setOrderData(null);
        setText("");
        setCapturedImage(null);
        
        // Navigate to inventory page after short delay
        setTimeout(() => {
          navigate('/inventory');
        }, 1500);
      } else {
        toast.error("Failed to process order receipt");
      }
    } catch (error) {
      console.error("Error processing order receipt:", error);
      toast.error("Failed to process order receipt");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Clear previous results when text changes
    setPatientData(null);
    setOrderData(null);
  };

  const handleModeChange = (newMode: "patient" | "order") => {
    setMode(newMode);
    setPatientData(null);
    setOrderData(null);
  };

  return {
    text,
    mode,
    isScanning,
    capturedImage,
    patientData,
    orderData,
    isProcessing,
    ocrProgress,
    isReady,
    handleCapture,
    handleProcessImage,
    handleStartCamera,
    handleStopCamera,
    handleFileUpload,
    handleCopyToClipboard,
    handleSavePatientMedicines,
    handleProcessOrderReceipt,
    handleTextChange,
    handleModeChange,
    setCapturedImage
  };
};
