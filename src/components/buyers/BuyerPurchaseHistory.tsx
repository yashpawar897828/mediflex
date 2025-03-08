
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { BuyerPurchase } from "@/types/buyers";

interface BuyerPurchaseHistoryProps {
  purchases: BuyerPurchase[];
  formatPrice: (amount: number) => string;
  onDeletePurchase: (purchaseId: number) => void;
}

const BuyerPurchaseHistory = ({ 
  purchases, 
  formatPrice, 
  onDeletePurchase 
}: BuyerPurchaseHistoryProps) => {
  return (
    <>
      {purchases.length > 0 ? (
        <div className="border rounded-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-2 px-4 text-left font-medium">Medicine</th>
                  <th className="py-2 px-4 text-left font-medium">Date</th>
                  <th className="py-2 px-4 text-left font-medium">Qty</th>
                  <th className="py-2 px-4 text-left font-medium">Price</th>
                  <th className="py-2 px-4 text-left font-medium">Total</th>
                  <th className="py-2 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{purchase.medicine}</td>
                    <td className="py-2 px-4">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{purchase.quantity}</td>
                    <td className="py-2 px-4">{formatPrice(purchase.price)}</td>
                    <td className="py-2 px-4">{formatPrice(purchase.price * purchase.quantity)}</td>
                    <td className="py-2 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePurchase(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No purchase history available
        </div>
      )}
    </>
  );
};

export default BuyerPurchaseHistory;
