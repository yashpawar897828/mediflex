
export interface BuyerPurchase {
  id: number;
  medicine: string;
  date: string;
  quantity: number;
  price: number;
}

export interface Buyer {
  id: number;
  name: string;
  contact: string;
  notes: string;
  purchases: BuyerPurchase[];
}
