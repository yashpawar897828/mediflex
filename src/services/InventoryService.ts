
import { toast } from "sonner";
import { dashboardService } from "./DashboardService";
import { OrderReceiptData } from "@/types/distributors";

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

  // Parse OCR text to extract product information
  parseOcrText(text: string): Partial<InventoryItem> {
    // Track OCR scan in the dashboard
    dashboardService.trackOcrScan();
    dashboardService.addActivity('ocr', `OCR scan: Document processed`);
    
    // This is a simple implementation - in a real app this would be more sophisticated
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Try to extract product details from OCR text
    let productData: Partial<InventoryItem> = {
      name: "",
      batch: "",
      expiry: "",
      price: 0,
      stock: 1
    };
    
    // Basic parsing logic - looks for common patterns in text
    for (const line of lines) {
      // Look for batch numbers (usually has "batch" or "lot" in it)
      if (line.toLowerCase().includes('batch') || line.toLowerCase().includes('lot')) {
        const batchMatch = line.match(/[A-Z0-9]{5,}/);
        if (batchMatch) productData.batch = batchMatch[0];
      }
      
      // Look for expiry dates
      const dateMatch = line.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
      if (dateMatch && !productData.expiry) {
        // Try to convert to YYYY-MM-DD format for the input
        try {
          const parts = dateMatch[0].split(/[\/\-\.]/);
          if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) year = `20${year}`;
            const month = parts[1].padStart(2, '0');
            const day = parts[0].padStart(2, '0');
            productData.expiry = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error("Failed to parse date:", e);
        }
      }
      
      // Look for price
      const priceMatch = line.match(/[\$£€]?\s*\d+[.,]\d{2}/);
      if (priceMatch && productData.price === 0) {
        const price = priceMatch[0].replace(/[\$£€\s]/g, '').replace(',', '.');
        productData.price = parseFloat(price);
      }
      
      // If we haven't found a name yet and line is not too long, use it as the product name
      if (!productData.name && line.length > 3 && line.length < 50 &&
          !line.match(/batch|lot|exp|price|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/i)) {
        productData.name = line;
      }
    }
    
    return productData;
  }

  // Parse OCR text specifically for order receipts
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
        const priceMatch = line.match(/[\$£€]?\s*\d+[.,]\d{2}/);
        const qtyMatch = line.match(/\b\d+\b/);  // Simple quantity pattern
        
        if (priceMatch) {
          // Price found, this might be a product line
          const price = parseFloat(priceMatch[0].replace(/[\$£€\s]/g, '').replace(',', '.'));
          
          // If we already have partial product info, save it and start a new one
          if (currentProduct.name) {
            currentProduct.price = price;
            orderData.products.push({...currentProduct});
            currentProduct = {};
          } else {
            // Start building a new product
            currentProduct = {
              price: price,
              quantity: qtyMatch ? parseInt(qtyMatch[0]) : 1,
              name: line.replace(priceMatch[0], '').trim().replace(/\b\d+\b/, '').trim()
            };
            
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
        } else if (!priceMatch && !qtyMatch && !currentProduct.name) {
          // This might be just the product name
          currentProduct.name = line.trim();
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
        const priceMatch = line.match(/[\$£€]?\s*\d+[.,]\d{2}/);
        const qtyMatch = line.match(/\b\d+\b/);
        
        if (priceMatch && line.length > 10) {
          const price = parseFloat(priceMatch[0].replace(/[\$£€\s]/g, '').replace(',', '.'));
          const quantity = qtyMatch ? parseInt(qtyMatch[0]) : 1;
          let name = line;
          
          // Remove price and quantity from the text to get the name
          if (priceMatch) name = name.replace(priceMatch[0], '');
          if (qtyMatch) name = name.replace(qtyMatch[0], '');
          
          name = name.replace(/x\s*\d+/, '').trim(); // Remove any "x quantity" patterns
          
          // If there's still some text left, it might be a product name
          if (name.length > 3) {
            orderData.products.push({
              name: name,
              price: price,
              quantity: quantity
            });
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
          expiry: orderData.date || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 6 months expiry
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
