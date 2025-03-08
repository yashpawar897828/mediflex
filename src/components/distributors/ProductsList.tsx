
import { Button } from "@/components/ui/button";
import { Distributor, DistributionProduct } from "@/types/distributors";
import { Trash2 } from "lucide-react";

interface ProductsListProps {
  distributor: Distributor;
  handleDeleteProduct: (distributorId: number, productId: number) => void;
  formatPrice: (amount: number) => string;
  calculateTotalValue: (products: DistributionProduct[]) => number;
}

const ProductsList = ({ 
  distributor, 
  handleDeleteProduct, 
  formatPrice,
  calculateTotalValue 
}: ProductsListProps) => {
  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-2 px-4 text-left font-medium">Product</th>
              <th className="py-2 px-4 text-left font-medium">Date</th>
              <th className="py-2 px-4 text-left font-medium">Qty</th>
              <th className="py-2 px-4 text-left font-medium">Price</th>
              <th className="py-2 px-4 text-left font-medium">Total</th>
              <th className="py-2 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {distributor.products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-muted/50">
                <td className="py-2 px-4">{product.name}</td>
                <td className="py-2 px-4">{new Date(product.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">{product.quantity}</td>
                <td className="py-2 px-4">{formatPrice(product.price)}</td>
                <td className="py-2 px-4">{formatPrice(product.price * product.quantity)}</td>
                <td className="py-2 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(distributor.id, product.id)}
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
  );
};

export default ProductsList;
