import { toast } from "sonner";
import { Distributor, DistributionProduct, OrderReceiptData } from "@/types/distributors";
import { dashboardService } from "./DashboardService";

// Storage key for distributors data
const STORAGE_KEY = "distributors";

class DistributorService {
  constructor() {
    // Initialize with empty array if not already set
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  // Get all distributors
  getDistributors(): Distributor[] {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error("Error parsing distributors data:", error);
      return [];
    }
  }

  // Clear all distributors
  clearDistributors(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }

  // Save distributor
  saveDistributor(distributor: Omit<Distributor, 'id'>): Distributor {
    const distributors = this.getDistributors();
    const newId = distributors.length > 0 
      ? Math.max(...distributors.map(item => item.id)) + 1 
      : 1;
    
    const newDistributor: Distributor = {
      id: newId,
      ...distributor
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...distributors, newDistributor]));
    
    return newDistributor;
  }

  // Update distributor
  updateDistributor(id: number, updates: Partial<Distributor>): Distributor | null {
    const distributors = this.getDistributors();
    const distributorIndex = distributors.findIndex(dist => dist.id === id);
    
    if (distributorIndex === -1) return null;
    
    const updatedDistributor = {
      ...distributors[distributorIndex],
      ...updates
    };
    
    distributors[distributorIndex] = updatedDistributor;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(distributors));
    
    return updatedDistributor;
  }

  // Add product to distributor
  addProductToDistributor(
    distributorId: number, 
    product: Omit<DistributionProduct, 'id'>
  ): Distributor | null {
    const distributors = this.getDistributors();
    const distributorIndex = distributors.findIndex(dist => dist.id === distributorId);
    
    if (distributorIndex === -1) return null;
    
    const newProductId = distributors[distributorIndex].products.length > 0
      ? Math.max(...distributors[distributorIndex].products.map(p => p.id)) + 1
      : 1;
    
    const newProduct: DistributionProduct = {
      id: newProductId,
      ...product
    };
    
    distributors[distributorIndex].products.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(distributors));
    
    // Track distribution activity
    dashboardService.addActivity(
      'distribution', 
      `${product.name} distributed by ${distributors[distributorIndex].name}`
    );
    
    return distributors[distributorIndex];
  }

  // Find distributor by name (case-insensitive partial match)
  findDistributorByName(name: string): Distributor | null {
    if (!name.trim()) return null;
    
    const distributors = this.getDistributors();
    const normalizedName = name.toLowerCase().trim();
    
    return distributors.find(
      dist => dist.name.toLowerCase().includes(normalizedName)
    ) || null;
  }

  // Process order receipt data by adding products to a distributor
  processOrderReceipt(receiptData: OrderReceiptData): { success: boolean; distributorId?: number } {
    try {
      // Find or create distributor
      let distributor: Distributor | null = null;
      
      if (receiptData.distributorName) {
        distributor = this.findDistributorByName(receiptData.distributorName);
      }
      
      if (!distributor && receiptData.distributorName) {
        // Create new distributor if not found
        distributor = this.saveDistributor({
          name: receiptData.distributorName,
          contact: receiptData.distributorContact || 'Unknown',
          address: '',
          products: []
        });
        
        toast.success(`Created new distributor: ${receiptData.distributorName}`);
      }
      
      if (!distributor) {
        toast.error("Could not identify distributor from receipt");
        return { success: false };
      }
      
      // Add each product to the distributor
      for (const product of receiptData.products) {
        if (product.name) {
          this.addProductToDistributor(distributor.id, {
            name: product.name,
            date: receiptData.date,
            quantity: product.quantity || 1,
            price: product.price || 0,
            receiptId: receiptData.receiptId
          });
        }
      }
      
      toast.success(`Added ${receiptData.products.length} products to ${distributor.name}`);
      return { success: true, distributorId: distributor.id };
    } catch (error) {
      console.error("Error processing order receipt:", error);
      toast.error("Failed to process order receipt");
      return { success: false };
    }
  }
}

// Export a singleton instance
export const distributorService = new DistributorService();
