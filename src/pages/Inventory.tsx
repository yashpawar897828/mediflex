import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const initialInventory = [
  { id: 1, name: "Paracetamol 500mg", expiry: "2025-06-30", batch: "PCM2023-45", price: 5.99, stock: 250 },
  { id: 2, name: "Amoxicillin 250mg", expiry: "2024-11-15", batch: "AMX2022-78", price: 12.50, stock: 120 },
  { id: 3, name: "Ibuprofen 400mg", expiry: "2026-03-22", batch: "IBP2023-32", price: 7.25, stock: 180 },
  { id: 4, name: "Cetirizine 10mg", expiry: "2025-09-10", batch: "CTZ2023-91", price: 8.99, stock: 90 }
];

interface InventoryItem {
  id: number;
  name: string;
  expiry: string;
  batch: string;
  price: number;
  stock: number;
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<InventoryItem, 'id'>>({
    name: "",
    expiry: "",
    batch: "",
    price: 0,
    stock: 0
  });

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.expiry || !newProduct.batch) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const productId = Math.max(0, ...inventory.map(item => item.id)) + 1;
    
    setInventory(prev => [
      ...prev,
      { id: productId, ...newProduct }
    ]);
    
    setNewProduct({
      name: "",
      expiry: "",
      batch: "",
      price: 0,
      stock: 0
    });
    
    setIsAddingProduct(false);
    toast.success("Product added successfully");
  };

  const handleEditProduct = (product: InventoryItem) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      expiry: product.expiry,
      batch: product.batch,
      price: product.price,
      stock: product.stock
    });
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    setInventory(prev => 
      prev.map(item => 
        item.id === editingProduct.id 
          ? { id: editingProduct.id, ...newProduct } 
          : item
      )
    );
    
    setEditingProduct(null);
    setNewProduct({
      name: "",
      expiry: "",
      batch: "",
      price: 0,
      stock: 0
    });
    
    toast.success("Product updated successfully");
  };

  const handleDeleteProduct = (id: number) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    toast.success("Product deleted successfully");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={() => setIsAddingProduct(true)} disabled={isAddingProduct || !!editingProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-6 relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      {(isAddingProduct || editingProduct) && (
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: "",
                      expiry: "",
                      batch: "",
                      price: 0,
                      stock: 0
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {filteredInventory.length > 0 ? (
                filteredInventory.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.batch}</td>
                    <td className="py-3 px-4">{formatDate(product.expiry)}</td>
                    <td className="py-3 px-4">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-4">{product.stock}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                          disabled={isAddingProduct || !!editingProduct}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isAddingProduct || !!editingProduct}
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
                    {searchTerm ? "No products found matching your search" : "No products in inventory"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
