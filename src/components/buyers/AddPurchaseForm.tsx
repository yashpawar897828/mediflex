
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BuyerPurchase } from "@/types/buyers";

interface AddPurchaseFormProps {
  newPurchase: Omit<BuyerPurchase, 'id'>;
  handlePurchaseInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddPurchase: () => void;
  onCancel: () => void;
}

const AddPurchaseForm = ({
  newPurchase,
  handlePurchaseInputChange,
  handleAddPurchase,
  onCancel
}: AddPurchaseFormProps) => {
  return (
    <Card className="border border-muted p-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="medicine">Medicine Name *</Label>
            <Input
              id="medicine"
              name="medicine"
              value={newPurchase.medicine}
              onChange={handlePurchaseInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Purchase Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={newPurchase.date}
              onChange={handlePurchaseInputChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={newPurchase.quantity}
              onChange={handlePurchaseInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price per Unit</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={newPurchase.price}
              onChange={handlePurchaseInputChange}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleAddPurchase}>
            Add Purchase
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AddPurchaseForm;
