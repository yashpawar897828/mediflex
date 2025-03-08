
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Distributor, DistributionProduct } from "@/types/distributors";
import { Edit, Plus, Trash2, Truck, Phone } from "lucide-react";
import ProductsList from "./ProductsList";
import AddProductForm from "./AddProductForm";

interface DistributorListProps {
  distributors: Distributor[];
  selectedDistributor: Distributor | null;
  isAddingProduct: boolean;
  newProduct: Omit<DistributionProduct, 'id'>;
  handleEditDistributor: (distributor: Distributor) => void;
  handleDeleteDistributor: (id: number) => void;
  setSelectedDistributor: (distributor: Distributor) => void;
  setIsAddingProduct: (isAdding: boolean) => void;
  handleProductInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddProduct: () => void;
  handleDeleteProduct: (distributorId: number, productId: number) => void;
  formatPrice: (amount: number) => string;
  calculateTotalValue: (products: DistributionProduct[]) => number;
  resetProductForm: () => void;
  isAddingDistributor: boolean;
}

const DistributorList = ({
  distributors,
  selectedDistributor,
  isAddingProduct,
  newProduct,
  handleEditDistributor,
  handleDeleteDistributor,
  setSelectedDistributor,
  setIsAddingProduct,
  handleProductInputChange,
  handleAddProduct,
  handleDeleteProduct,
  formatPrice,
  calculateTotalValue,
  resetProductForm,
  isAddingDistributor
}: DistributorListProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {distributors.map((distributor) => (
        <Card key={distributor.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-primary" /> {distributor.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" /> {distributor.contact}
                </div>
                {distributor.address && (
                  <p className="text-sm text-muted-foreground mt-1">{distributor.address}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditDistributor(distributor)}
                  disabled={isAddingDistributor}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteDistributor(distributor.id)}
                  disabled={isAddingDistributor}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Product List</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    Total value: <span className="font-bold">{formatPrice(calculateTotalValue(distributor.products))}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => { 
                      setSelectedDistributor(distributor); 
                      setIsAddingProduct(true); 
                    }}
                    disabled={isAddingProduct}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Product
                  </Button>
                </div>
              </div>

              {isAddingProduct && selectedDistributor?.id === distributor.id && (
                <AddProductForm
                  newProduct={newProduct}
                  handleProductInputChange={handleProductInputChange}
                  handleAddProduct={handleAddProduct}
                  onCancel={resetProductForm}
                />
              )}

              {distributor.products.length > 0 ? (
                <ProductsList
                  distributor={distributor}
                  handleDeleteProduct={handleDeleteProduct}
                  formatPrice={formatPrice}
                  calculateTotalValue={calculateTotalValue}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No products available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DistributorList;
