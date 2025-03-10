
import { BuyerPurchase } from "@/types/buyers";

export const formatPrice = (amount: number): string => {
  return `₹${Math.round(amount)}`;
};

export const calculateTotalSpend = (purchases: BuyerPurchase[]): number => {
  return purchases.reduce((total, purchase) => total + (purchase.price * purchase.quantity), 0);
};
