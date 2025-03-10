
import { BuyerPurchase } from "@/types/buyers";

export const formatPrice = (amount: number): string => {
  return `₹${Math.round(amount)}`;
};

export const calculateTotalSpend = (purchases: BuyerPurchase[]): number => {
  return purchases.reduce((total, purchase) => total + (purchase.price * purchase.quantity), 0);
};

// New function to determine if a buyer is a regular buyer based on purchase frequency
export const isRegularBuyer = (purchases: BuyerPurchase[]): boolean => {
  // Check if the buyer has made more than 3 purchases
  return purchases.length > 3;
};
