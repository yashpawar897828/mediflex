
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { InventoryItem } from "@/services/InventoryService";

interface InventoryTableProps {
  inventory: InventoryItem[];
  onEdit: (product: InventoryItem) => void;
  onDelete: (id: number) => void;
  isDisabled: boolean;
  formatDate: (dateString: string) => string;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  onEdit,
  onDelete,
  isDisabled,
  formatDate,
}) => {
  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 px-4 text-left font-medium">Product Name</th>
              <th className="py-3 px-4 text-left font-medium">Batch Number</th>
              <th className="py-3 px-4 text-left font-medium">Expiry Date</th>
              <th className="py-3 px-4 text-left font-medium">Price</th>
              <th className="py-3 px-4 text-left font-medium">Stock</th>
              <th className="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? (
              inventory.map((product) => (
                <tr key={product.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.batch}</td>
                  <td className="py-3 px-4">{formatDate(product.expiry)}</td>
                  <td className="py-3 px-4">₹{product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(product)}
                        disabled={isDisabled}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(product.id)}
                        disabled={isDisabled}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No products in inventory
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
