
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/services/InventoryService";

interface InventoryFormProps {
  newProduct: Omit<InventoryItem, 'id'>;
  editingProduct: InventoryItem | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  newProduct,
  editingProduct,
  onInputChange,
  onCancel,
  onSave,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Product Name *
              </label>
              <Input
                id="name"
                name="name"
                value={newProduct.name}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="batch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Batch Number *
              </label>
              <Input
                id="batch"
                name="batch"
                value={newProduct.batch}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="expiry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Expiry Date *
              </label>
              <Input
                id="expiry"
                name="expiry"
                type="date"
                value={newProduct.expiry}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Price
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={onInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Stock Quantity
              </label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={onInputChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              {editingProduct ? "Update" : "Add"} Product
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryForm;
