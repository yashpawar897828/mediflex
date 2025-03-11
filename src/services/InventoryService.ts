import { toast } from "sonner";
import { dashboardService } from "./DashboardService";
import { OrderReceiptData, PatientRecipient, Medicine } from "@/types/distributors";

// Define the inventory item interface for use throughout the app
export interface InventoryItem {
  id: number;
  name: string;
  expiry: string;
  batch: string;
  price: number;
  stock: number;
  distributorId?: number; // Reference to the distributor
  receiptId?: string;     // Reference to the receipt
}

// This simulates a database in localStorage
const STORAGE_KEY = "mediflex_inventory";

// Service to handle inventory data operations
class InventoryService {
  // Clear any demo data on initialization
  constructor() {
    // Initialize with empty array if not already set
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  // Get all inventory items
  getInventory(): InventoryItem[] {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error("Error parsing inventory data:", error);
      return [];
    }
  }

  // Add or update an inventory item
  saveItem(item: Omit<InventoryItem, 'id'>): InventoryItem {
    const inventory = this.getInventory();
    const newId = inventory.length > 0 
      ? Math.max(...inventory.map(item => item.id)) + 1 
      : 1;
    
    const newItem: InventoryItem = {
      id: newId,
      ...item
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...inventory, newItem]));
    return newItem;
  }

  // Clear all inventory data
  clearInventory(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }

  // Update an existing item
  updateItem(id: number, updates: Partial<InventoryItem>): InventoryItem | null {
    const inventory = this.getInventory();
    const itemIndex = inventory.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return null;
    
    const updatedItem = {
      ...inventory[itemIndex],
      ...updates
    };
    
    inventory[itemIndex] = updatedItem;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    
    return updatedItem;
  }

  // Search inventory by text (searches name and batch fields)
  searchInventory(searchText: string): InventoryItem[] {
    if (!searchText.trim()) return [];
    
    const inventory = this.getInventory();
    const normalizedSearch = searchText.toLowerCase().trim();
    
    return inventory.filter(item => 
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.batch.toLowerCase().includes(normalizedSearch)
    );
  }

  // Find an exact match for a barcode (batch number)
  findByBarcode(barcode: string): InventoryItem | null {
    if (!barcode.trim()) return null;
    
    const inventory = this.getInventory();
    const item = inventory.find(item => item.batch === barcode) || null;
    
    // Track this barcode scan in the dashboard
    if (item) {
      dashboardService.addActivity('barcode', `Product scan: ${item.name} (${barcode})`);
    }
    
    return item;
  }

  // New method to parse patient and medicines information
  parsePatientMedicines(text: string): PatientRecipient {
    // Track OCR scan in the dashboard
    dashboardService.trackOcrScan();
    dashboardService.addActivity('ocr', `OCR scan: Patient document processed`);
    
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Initialize patient data
    let patientData: PatientRecipient = {
      name: "",
      contact: "",
      medicines: []
    };
    
    let currentMedicine: Partial<Medicine> = {};
    let inMedicinesList = false;
    
    // Try to find patient name - usually at the top of the document
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Look for name indicators
      if (line.toLowerCase().includes('patient') || line.toLowerCase().includes('name')) {
        // Extract name after "patient:" or "name:"
        const nameMatch = line.match(/(?:patient|name)[:\s]+([^,]+)/i);
        if (nameMatch && nameMatch[1]) {
          patientData.name = nameMatch[1].trim();
          break;
        }
      }
      // If we haven't found a name and the line isn't too long, use it as patient name
      else if (!patientData.name && line.length > 3 && line.length < 40) {
        patientData.name = line;
        break;
      }
    }
    
    // Look for contact info
    for (const line of lines) {
      if (line.toLowerCase().includes('contact') || 
          line.toLowerCase().includes('phone') || 
          line.toLowerCase().includes('tel') ||
          line.match(/\+?\d{10,}/)) {
        
        const phoneMatch = line.match(/\+?[\d\s\-]{10,}/);
        if (phoneMatch) {
          patientData.contact = phoneMatch[0].trim();
          break;
        }
      }
    }
    
    // Look for medicine list indicators
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (line.includes('medicine') || 
          line.includes('prescription') || 
          line.includes('medication') ||
          line.includes('drug')) {
        inMedicinesList = true;
        continue;
      }
      
      if (inMedicinesList) {
        // Look for batch numbers
        const batchMatch = lines[i].match(/batch[:\s]+([\w\d-]+)/i) || 
                           lines[i].match(/lot[:\s]+([\w\d-]+)/i);
        
        // Look for expiry date
        const expiryMatch = lines[i].match(/exp(?:iry)?[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
                            lines[i].match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
        
        // Look for quantity
        const qtyMatch = lines[i].match(/qty[:\s]+(\d+)/i) || 
                         lines[i].match(/quantity[:\s]+(\d+)/i) ||
                         lines[i].match(/(\d+)\s+(?:tablet|capsule|pill|dose)/i);
        
        // Look for price
        const priceMatch = lines[i].match(/(?:price|cost)[:\s]+[\$₹£€]?\s*(\d+(?:[.,]\d{1,2})?)/i) ||
                           lines[i].match(/[\$₹£€]\s*(\d+(?:[.,]\d{1,2})?)/);
        
        // If we have some medicine-related info on this line
        if (batchMatch || expiryMatch || qtyMatch || priceMatch) {
          // If we already have a medicine name, save it
          if (currentMedicine.name) {
            if (batchMatch) currentMedicine.batch = batchMatch[1];
            if (expiryMatch) {
              try {
                const dateParts = expiryMatch[1].split(/[\/\-\.]/);
                if (dateParts.length === 3) {
                  let year = dateParts[2];
                  if (year.length === 2) year = `20${year}`;
                  const month = dateParts[1].padStart(2, '0');
                  const day = dateParts[0].padStart(2, '0');
                  currentMedicine.expiry = `${year}-${month}-${day}`;
                }
              } catch (e) {
                console.error("Failed to parse expiry date:", e);
              }
            }
            if (qtyMatch) currentMedicine.quantity = parseInt(qtyMatch[1]);
            if (priceMatch) currentMedicine.price = parseFloat(priceMatch[1].replace(',', '.'));
            
            // Add the medicine to the list
            patientData.medicines.push(currentMedicine as Medicine);
            currentMedicine = {};
          }
          // If no medicine name yet, store the data and wait for a name
          else {
            if (batchMatch) currentMedicine.batch = batchMatch[1];
            if (expiryMatch) {
              try {
                const dateParts = expiryMatch[1].split(/[\/\-\.]/);
                if (dateParts.length === 3) {
                  let year = dateParts[2];
                  if (year.length === 2) year = `20${year}`;
                  const month = dateParts[1].padStart(2, '0');
                  const day = dateParts[0].padStart(2, '0');
                  currentMedicine.expiry = `${year}-${month}-${day}`;
                }
              } catch (e) {
                console.error("Failed to parse expiry date:", e);
              }
            }
            if (qtyMatch) currentMedicine.quantity = parseInt(qtyMatch[1]);
            if (priceMatch) currentMedicine.price = parseFloat(priceMatch[1].replace(',', '.'));
          }
        }
        // If line doesn't have specific medicine details, it might be a medicine name
        else if (lines[i].length > 3 && lines[i].length < 50) {
          // If we already have a medicine with details but no name, use this line as the name
          if (Object.keys(currentMedicine).length > 0 && !currentMedicine.name) {
            currentMedicine.name = lines[i];
            patientData.medicines.push(currentMedicine as Medicine);
            currentMedicine = {};
          }
          // Otherwise, start a new medicine
          else {
            // Save any previous medicine
            if (currentMedicine.name) {
              patientData.medicines.push({
                name: currentMedicine.name,
                quantity: currentMedicine.quantity || 1,
                price: currentMedicine.price || 0,
                batch: currentMedicine.batch,
                expiry: currentMedicine.expiry
              });
            }
            
            // Start a new medicine
            currentMedicine = { name: lines[i] };
          }
        }
      }
    }
    
    // Add any final medicine that wasn't added
    if (currentMedicine.name) {
      patientData.medicines.push({
        name: currentMedicine.name,
        quantity: currentMedicine.quantity || 1,
        price: currentMedicine.price || 0,
        batch: currentMedicine.batch,
        expiry: currentMedicine.expiry
      });
    }
    
    // If no medicines were found with structured approach, try a simpler approach
    if (patientData.medicines.length === 0) {
      // Look for possible medicine names (lines that aren't patient info and have reasonable length)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > 3 && lines[i].length < 50 && 
            !lines[i].toLowerCase().includes('patient') &&
            !lines[i].toLowerCase().includes('name') &&
            !lines[i].toLowerCase().includes('contact') &&
            !lines[i].toLowerCase().includes('phone') &&
            !lines[i].match(/\+?\d{10,}/)) {
          
          patientData.medicines.push({
            name: lines[i],
            quantity: 1,
            price: 0
          });
        }
      }
    }
    
    return patientData;
  }

  // Enhanced method to parse order receipts with all required fields
  parseOrderReceipt(text: string): OrderReceiptData {
    // Track OCR scan in the dashboard
    dashboardService.trackOcrScan();
    dashboardService.addActivity('ocr', `OCR scan: Order receipt processed`);
    
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    let orderData: OrderReceiptData = {
      products: [],
      date: new Date().toISOString().split('T')[0]
    };
    
    // Try to identify distributor information
    let inProductList = false;
    let currentProduct: any = {};
    
    for (const line of lines) {
      // Check for distributor info typically at the top of receipt
      if (!orderData.distributorName && 
          (line.toLowerCase().includes("distributor") || 
           line.toLowerCase().includes("supplier") || 
           line.toLowerCase().includes("vendor"))) {
        // Try to extract distributor name
        const nameMatch = line.match(/(?:distributor|supplier|vendor)[:\s]+([^,]+)/i);
        if (nameMatch && nameMatch[1]) {
          orderData.distributorName = nameMatch[1].trim();
        } else {
          // If no specific format, just take the next line as the distributor name
          const nextIndex = lines.indexOf(line) + 1;
          if (nextIndex < lines.length) {
            orderData.distributorName = lines[nextIndex].trim();
          }
        }
        continue;
      }
      
      // Look for contact info
      if (!orderData.distributorContact && 
          (line.toLowerCase().includes("contact") || 
           line.toLowerCase().includes("phone") || 
           line.match(/\+?\d{10,}/))) {
        const phoneMatch = line.match(/\+?\d[\d\s\-]{8,}/);
        if (phoneMatch) {
          orderData.distributorContact = phoneMatch[0].trim();
        }
        continue;
      }
      
      // Look for receipt or order ID
      if (!orderData.receiptId && 
          (line.toLowerCase().includes("receipt") || 
           line.toLowerCase().includes("order") || 
           line.toLowerCase().includes("invoice"))) {
        const idMatch = line.match(/(?:receipt|order|invoice)(?:[\s#:]+)([A-Z0-9\-]+)/i);
        if (idMatch && idMatch[1]) {
          orderData.receiptId = idMatch[1].trim();
        }
        continue;
      }
      
      // Look for date
      const dateMatch = line.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
      if (dateMatch) {
        try {
          const parts = dateMatch[0].split(/[\/\-\.]/);
          if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) year = `20${year}`;
            const month = parts[1].padStart(2, '0');
            const day = parts[0].padStart(2, '0');
            orderData.date = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error("Failed to parse date:", e);
        }
      }
      
      // Look for batch numbers
      const batchMatch = line.match(/batch[:\s]+([\w\d-]+)/i) || 
                         line.match(/lot[:\s]+([\w\d-]+)/i) ||
                         line.match(/b\/no[:\s]+([\w\d-]+)/i);
      
      // Look for expiry dates
      const expiryMatch = line.match(/exp(?:iry)?[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
      
      // Check for product list indicators
      if (line.toLowerCase().includes("item") && 
          (line.toLowerCase().includes("qty") || line.toLowerCase().includes("quantity")) && 
          (line.toLowerCase().includes("price") || line.toLowerCase().includes("amount"))) {
        inProductList = true;
        continue;
      }
      
      // Parse products after we've identified we're in the product list
      if (inProductList) {
        // Detect if this line contains product information
        const priceMatch = line.match(/[\$₹£€]?\s*\d+[.,]\d{2}/);
        const qtyMatch = line.match(/\b\d+\b/);  // Simple quantity pattern
        
        if (priceMatch) {
          // Price found, this might be a product line
          const price = parseFloat(priceMatch[0].replace(/[\$₹£€\s]/g, '').replace(',', '.'));
          
          // If we already have partial product info, save it and start a new one
          if (currentProduct.name) {
            currentProduct.price = price;
            
            // Try to extract batch and expiry if they exist
            if (batchMatch) currentProduct.batch = batchMatch[1];
            if (expiryMatch) {
              try {
                const dateParts = expiryMatch[1].split(/[\/\-\.]/);
                if (dateParts.length === 3) {
                  let year = dateParts[2];
                  if (year.length === 2) year = `20${year}`;
                  const month = dateParts[1].padStart(2, '0');
                  const day = dateParts[0].padStart(2, '0');
                  currentProduct.expiry = `${year}-${month}-${day}`;
                }
              } catch (e) {
                console.error("Failed to parse expiry date:", e);
              }
            }
            
            orderData.products.push({...currentProduct});
            currentProduct = {};
          } else {
            // Start building a new product
            currentProduct = {
              price: price,
              quantity: qtyMatch ? parseInt(qtyMatch[0]) : 1,
              name: line.replace(priceMatch[0], '').trim().replace(/\b\d+\b/, '').trim()
            };
            
            // Try to extract batch and expiry if they exist
            if (batchMatch) currentProduct.batch = batchMatch[1];
            if (expiryMatch) {
              try {
                const dateParts = expiryMatch[1].split(/[\/\-\.]/);
                if (dateParts.length === 3) {
                  let year = dateParts[2];
                  if (year.length === 2) year = `20${year}`;
                  const month = dateParts[1].padStart(2, '0');
                  const day = dateParts[0].padStart(2, '0');
                  currentProduct.expiry = `${year}-${month}-${day}`;
                }
              } catch (e) {
                console.error("Failed to parse expiry date:", e);
              }
            }
            
            // Check if we have enough info to save this product immediately
            if (currentProduct.name) {
              orderData.products.push({...currentProduct});
              currentProduct = {};
            }
          }
        } else if (qtyMatch && !currentProduct.name) {
          // This might be just the product name and quantity, price will come in another line
          currentProduct = {
            quantity: parseInt(qtyMatch[0]),
            name: line.replace(/\b\d+\b/, '').trim()
          };
          
          // Try to extract batch and expiry if they exist
          if (batchMatch) currentProduct.batch = batchMatch[1];
          if (expiryMatch) {
            try {
              const dateParts = expiryMatch[1].split(/[\/\-\.]/);
              if (dateParts.length === 3) {
                let year = dateParts[2];
                if (year.length === 2) year = `20${year}`;
                const month = dateParts[1].padStart(2, '0');
                const day = dateParts[0].padStart(2, '0');
                currentProduct.expiry = `${year}-${month}-${day}`;
              }
            } catch (e) {
              console.error("Failed to parse expiry date:", e);
            }
          }
        } else if (!priceMatch && !qtyMatch && !currentProduct.name) {
          // This might be just the product name
          currentProduct.name = line.trim();
          
          // Try to extract batch and expiry if they exist
          if (batchMatch) currentProduct.batch = batchMatch[1];
          if (expiryMatch) {
            try {
              const dateParts = expiryMatch[1].split(/[\/\-\.]/);
              if (dateParts.length === 3) {
                let year = dateParts[2];
                if (year.length === 2) year = `20${year}`;
                const month = dateParts[1].padStart(2, '0');
                const day = dateParts[0].padStart(2, '0');
                currentProduct.expiry = `${year}-${month}-${day}`;
              }
            } catch (e) {
              console.error("Failed to parse expiry date:", e);
            }
          }
        }
      }
    }
    
    // Add any remaining product
    if (currentProduct.name) {
      if (!currentProduct.price) currentProduct.price = 0;
      if (!currentProduct.quantity) currentProduct.quantity = 1;
      orderData.products.push(currentProduct);
    }
    
    // If no products were found with the structured approach, try a simpler approach
    if (orderData.products.length === 0) {
      // Look for lines that might contain product info (has numbers and text)
      for (const line of lines) {
        const priceMatch = line.match(/[\$₹£€]?\s*\d+[.,]\d{2}/);
        const qtyMatch = line.match(/\b\d+\b/);
        const batchMatch = line.match(/batch[:\s]+([\w\d-]+)/i) || 
                           line.match(/lot[:\s]+([\w\d-]+)/i) ||
                           line.match(/b\/no[:\s]+([\w\d-]+)/i);
        const expiryMatch = line.match(/exp(?:iry)?[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) || 
                            line.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
        
        if ((priceMatch || qtyMatch) && line.length > 10) {
          const price = priceMatch ? parseFloat(priceMatch[0].replace(/[\$₹£€\s]/g, '').replace(',', '.')) : 0;
          const quantity = qtyMatch ? parseInt(qtyMatch[0]) : 1;
          let name = line;
          
          // Remove price and quantity from the text to get the name
          if (priceMatch) name = name.replace(priceMatch[0], '');
          if (qtyMatch) name = name.replace(qtyMatch[0], '');
          
          name = name.replace(/x\s*\d+/, '').trim(); // Remove any "x quantity" patterns
          
          // If there's still some text left, it might be a product name
          if (name.length > 3) {
            const product: any = {
              name: name,
              price: price,
              quantity: quantity
            };
            
            // Add batch and expiry if found
            if (batchMatch) product.batch = batchMatch[1];
            if (expiryMatch) {
              try {
                const dateParts = expiryMatch[0].split(/[\/\-\.]/);
                if (dateParts.length === 3) {
                  let year = dateParts[2];
                  if (year.length === 2) year = `20${year}`;
                  const month = dateParts[1].padStart(2, '0');
                  const day = dateParts[0].padStart(2, '0');
                  product.expiry = `${year}-${month}-${day}`;
                }
              } catch (e) {
                console.error("Failed to parse expiry date:", e);
              }
            }
            
            orderData.products.push(product);
          }
        }
      }
    }
    
    return orderData;
  }

  // Add products from order receipt to inventory
  addOrderToInventory(orderData: OrderReceiptData, distributorId?: number): InventoryItem[] {
    const addedItems: InventoryItem[] = [];
    
    for (const product of orderData.products) {
      if (product.name) {
        // Generate a default batch number if none is provided
        const batchPrefix = orderData.distributorName?.substring(0, 3).toUpperCase() || "MED";
        const timestamp = Date.now().toString().substring(7);
        
        const newItem = this.saveItem({
          name: product.name,
          batch: product.batch || `${batchPrefix}${timestamp}${addedItems.length}`,
          expiry: product.expiry || orderData.date || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 6 months expiry
          price: product.price || 0,
          stock: product.quantity || 1,
          distributorId: distributorId,
          receiptId: orderData.receiptId
        });
        
        addedItems.push(newItem);
      }
    }
    
    if (addedItems.length > 0) {
      dashboardService.addActivity(
        'distribution', 
        `Added ${addedItems.length} products from order receipt`
      );
    }
    
    return addedItems;
  }
}

// Export a singleton instance
export const inventoryService = new InventoryService();
