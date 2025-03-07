
import { toast } from "sonner";

// Define the inventory item interface for use throughout the app
export interface InventoryItem {
  id: number;
  name: string;
  expiry: string;
  batch: string;
  price: number;
  stock: number;
}

// This simulates a database in localStorage
const STORAGE_KEY = "mediflex_inventory";

// Service to handle inventory data operations
class InventoryService {
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
    return inventory.find(item => item.batch === barcode) || null;
  }

  // Parse OCR text to extract product information
  parseOcrText(text: string): Partial<InventoryItem> {
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
}

// Export a singleton instance
export const inventoryService = new InventoryService();
