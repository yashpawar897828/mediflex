
export interface DistributionProduct {
  id: number;
  name: string;
  date: string;
  quantity: number;
  price: number;
  receiptId?: string; // Reference to the receipt that added this product
  batchNumber?: string; // Added batch number
  expiryDate?: string; // Added expiry date
}

export interface Distributor {
  id: number;
  name: string;
  contact: string;
  address: string;
  products: DistributionProduct[];
}

export interface Medicine {
  name: string;
  quantity: number;
  price: number;
  batch?: string;
  expiry?: string;
}

export interface PatientRecipient {
  name: string;
  id?: string;
  contact?: string;
  medicines: Medicine[];
}

// Enhanced interface for extracted receipt data
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
    expiry?: string; // Added expiry date
  }>;
  date: string;
}
