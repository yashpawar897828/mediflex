
export interface DistributionProduct {
  id: number;
  name: string;
  date: string;
  quantity: number;
  price: number;
  receiptId?: string; // Reference to the receipt that added this product
}

export interface Distributor {
  id: number;
  name: string;
  contact: string;
  address: string;
  products: DistributionProduct[];
}

// New interface for extracted receipt data
export interface OrderReceiptData {
  distributorName?: string;
  distributorContact?: string;
  distributorId?: string;
  receiptId?: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    batch?: string;
  }>;
  date: string;
}
