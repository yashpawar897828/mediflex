
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DistributionProduct } from "@/types/distributors";

interface AddProductFormProps {
  newProduct: Omit<DistributionProduct, 'id'>;
  handleProductInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddProduct: () => void;
  onCancel: () => void;
}

const AddProductForm = ({
  newProduct,
  handleProductInputChange,
  handleAddProduct,
  onCancel
}: AddProductFormProps) => {
  return (
    <Card className="border border-muted p-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              name="name"
              value={newProduct.name}
              onChange={handleProductInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Distribution Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={newProduct.date}
              onChange={handleProductInputChange}
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
              value={newProduct.quantity}
              onChange={handleProductInputChange}
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
              value={newProduct.price}
              onChange={handleProductInputChange}
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
          <Button size="sm" onClick={handleAddProduct}>
            Add Product
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AddProductForm;
