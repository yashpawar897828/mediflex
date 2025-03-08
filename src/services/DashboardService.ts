import { inventoryService, InventoryItem } from "./InventoryService";

// Define interfaces for the dashboard stats
interface DashboardStat {
  title: string;
  value: string;
  description: string;
}

export interface RecentActivity {
  type: 'barcode' | 'ocr' | 'distribution' | 'report';
  title: string;
  timestamp: Date;
}

// Service to handle dashboard data calculations
class DashboardService {
  // Get all dashboard statistics
  getDashboardStats(): DashboardStat[] {
    const inventory = inventoryService.getInventory();
    
    // Calculate total products
    const totalProducts = inventory.length;
    
    // Get regular buyers data from local storage
    const regularBuyersData = localStorage.getItem('regularBuyers');
    const regularBuyers = regularBuyersData ? JSON.parse(regularBuyersData) : [];
    const activeBuyers = regularBuyers.length;
    
    // Get distributions data from local storage
    const distributorsData = localStorage.getItem('distributors');
    const distributors = distributorsData ? JSON.parse(distributorsData) : [];
    
    // Calculate total distributions this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    let monthlyDistributions = 0;
    distributors.forEach((distributor: any) => {
      distributor.products.forEach((product: any) => {
        const productDate = new Date(product.date);
        if (productDate >= firstDayOfMonth) {
          monthlyDistributions++;
        }
      });
    });
    
    // Calculate total sales this month
    let monthlySales = 0;
    if (regularBuyersData) {
      const buyers = JSON.parse(regularBuyersData);
      buyers.forEach((buyer: any) => {
        buyer.purchases.forEach((purchase: any) => {
          const purchaseDate = new Date(purchase.date);
          if (purchaseDate >= firstDayOfMonth) {
            monthlySales += purchase.price * purchase.quantity;
          }
        });
      });
    }
    
    // Get OCR scan count from local storage
    const ocrScans = localStorage.getItem('ocrScansCount') 
      ? parseInt(localStorage.getItem('ocrScansCount') || '0') 
      : 0;
    
    // Get report count from local storage
    const reportsGenerated = localStorage.getItem('reportsCount')
      ? parseInt(localStorage.getItem('reportsCount') || '0')
      : 0;
    
    return [
      { title: "Total Products", value: totalProducts.toString(), description: "Products in database" },
      { title: "OCR Scans", value: ocrScans.toString(), description: "Documents scanned" },
      { title: "Regular Buyers", value: activeBuyers.toString(), description: "Active customers" },
      { title: "Distributions", value: monthlyDistributions.toString(), description: "This month" },
      { title: "Total Sales", value: `₹${Math.round(monthlySales)}`, description: "This month" },
      { title: "Reports Generated", value: reportsGenerated.toString(), description: "This month" }
    ];
  }
  
  // Get recent activities
  getRecentActivities(): RecentActivity[] {
    const activitiesData = localStorage.getItem('recentActivities');
    if (!activitiesData) return [];
    
    try {
      const activities = JSON.parse(activitiesData);
      // Convert string timestamps back to Date objects
      return activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
    } catch (error) {
      console.error("Error parsing activities data:", error);
      return [];
    }
  }
  
  // Add a new activity
  addActivity(type: 'barcode' | 'ocr' | 'distribution' | 'report', title: string): void {
    const activities = this.getRecentActivities();
    
    // Add new activity at the beginning (most recent first)
    const newActivity = {
      type,
      title,
      timestamp: new Date()
    };
    
    // Only keep the 10 most recent activities
    const updatedActivities = [newActivity, ...activities].slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
  }
  
  // Track OCR scans 
  trackOcrScan(): void {
    const currentCount = localStorage.getItem('ocrScansCount')
      ? parseInt(localStorage.getItem('ocrScansCount') || '0')
      : 0;
    
    localStorage.setItem('ocrScansCount', (currentCount + 1).toString());
  }
  
  // Track generated reports
  trackReport(): void {
    const currentCount = localStorage.getItem('reportsCount')
      ? parseInt(localStorage.getItem('reportsCount') || '0')
      : 0;
    
    localStorage.setItem('reportsCount', (currentCount + 1).toString());
  }
}

// Export a singleton instance
export const dashboardService = new DashboardService();
