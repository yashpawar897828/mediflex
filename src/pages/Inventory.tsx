
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { inventoryService, InventoryItem } from "@/services/InventoryService";
import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventorySearch from "@/components/inventory/InventorySearch";

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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

  // Load inventory data from service on component mount
  useEffect(() => {
    const loadInventory = () => {
      const data = inventoryService.getInventory();
      setInventory(data);
    };
    
    loadInventory();
  }, []);

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
    
    try {
      const savedItem = inventoryService.saveItem(newProduct);
      
      setInventory(prev => [...prev, savedItem]);
      
      setNewProduct({
        name: "",
        expiry: "",
        batch: "",
        price: 0,
        stock: 0
      });
      
      setIsAddingProduct(false);
      toast.success("Product added successfully");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
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
    
    try {
      const updatedItem = inventoryService.updateItem(editingProduct.id, newProduct);
      
      if (updatedItem) {
        setInventory(prev => 
          prev.map(item => 
            item.id === editingProduct.id ? updatedItem : item
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
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = (id: number) => {
    // Use the current inventory array to persist to localStorage without the deleted item
    const updatedInventory = inventory.filter(item => item.id !== id);
    localStorage.setItem("mediflex_inventory", JSON.stringify(updatedInventory));
    
    // Update state
    setInventory(updatedInventory);
    toast.success("Product deleted successfully");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearInventory = () => {
    inventoryService.clearInventory();
    setInventory([]);
    toast.success("Inventory cleared successfully");
  };

  const handleCancelForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      expiry: "",
      batch: "",
      price: 0,
      stock: 0
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClearInventory} variant="outline">
            Clear All
          </Button>
          <Button 
            onClick={() => setIsAddingProduct(true)} 
            disabled={isAddingProduct || !!editingProduct}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <InventorySearch 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
      />

      {(isAddingProduct || editingProduct) && (
        <InventoryForm
          newProduct={newProduct}
          editingProduct={editingProduct}
          onInputChange={handleInputChange}
          onCancel={handleCancelForm}
          onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        />
      )}

      <InventoryTable 
        inventory={filteredInventory}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        isDisabled={isAddingProduct || !!editingProduct}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Inventory;
