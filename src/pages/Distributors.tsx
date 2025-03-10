
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { dashboardService } from "@/services/DashboardService";
import { Distributor, DistributionProduct } from "@/types/distributors";
import { distributorService } from "@/services/DistributorService";
import DistributorSearch from "@/components/distributors/DistributorSearch";
import DistributorForm from "@/components/distributors/DistributorForm";
import DistributorList from "@/components/distributors/DistributorList";

const Distributors = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [isAddingDistributor, setIsAddingDistributor] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const [newDistributor, setNewDistributor] = useState<Omit<Distributor, 'id'>>({
    name: "",
    contact: "",
    address: "",
    products: []
  });
  
  const [newProduct, setNewProduct] = useState<Omit<DistributionProduct, 'id'>>({
    name: "",
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0
  });

  useEffect(() => {
    loadDistributors();
  }, []);

  const loadDistributors = () => {
    // This will now only load regular distributors thanks to our service update
    const data = distributorService.getDistributors();
    setDistributors(data);
  };

  const filteredDistributors = distributors.filter(distributor => 
    distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    distributor.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDistributor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleAddDistributor = () => {
    if (!newDistributor.name || !newDistributor.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newDist = distributorService.saveDistributor(newDistributor);
    
    // Only show the distributor in the list if it's a regular distributor
    if (distributorService.isRegularDistributor(newDist)) {
      setDistributors(prev => [...prev, newDist]);
    }
    
    resetDistributorForm();
    toast.success("Distributor added successfully");
  };

  const handleUpdateDistributor = () => {
    if (!selectedDistributor) return;
    
    const updated = distributorService.updateDistributor(selectedDistributor.id, newDistributor);
    
    if (updated) {
      setDistributors(prev => 
        prev.map(distributor => 
          distributor.id === selectedDistributor.id ? updated : distributor
        )
      );
    }
    
    resetDistributorForm();
    toast.success("Distributor updated successfully");
  };

  const handleDeleteDistributor = (id: number) => {
    const updatedDistributors = distributors.filter(distributor => distributor.id !== id);
    localStorage.setItem("distributors", JSON.stringify(updatedDistributors));
    setDistributors(updatedDistributors);
    toast.success("Distributor deleted successfully");
  };

  const handleAddProduct = () => {
    if (!selectedDistributor || !newProduct.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const updated = distributorService.addProductToDistributor(selectedDistributor.id, newProduct);
    
    if (updated) {
      setDistributors(prev => 
        prev.map(distributor => 
          distributor.id === selectedDistributor.id ? updated : distributor
        )
      );
    }
    
    dashboardService.addActivity('distribution', `Distribution: ${newProduct.name} to ${selectedDistributor.name}`);
    
    resetProductForm();
    toast.success("Product added successfully");
  };

  const handleDeleteProduct = (distributorId: number, productId: number) => {
    setDistributors(prev => 
      prev.map(distributor => 
        distributor.id === distributorId 
          ? { 
              ...distributor, 
              products: distributor.products.filter(p => p.id !== productId)
            } 
          : distributor
      )
    );
    
    localStorage.setItem("distributors", JSON.stringify(distributors.map(distributor => 
      distributor.id === distributorId 
        ? { 
            ...distributor, 
            products: distributor.products.filter(p => p.id !== productId)
          } 
        : distributor
    )));
    
    toast.success("Product deleted successfully");
  };

  const handleClearDistributors = () => {
    distributorService.clearDistributors();
    setDistributors([]);
    toast.success("All distributors cleared successfully");
  };

  const handleEditDistributor = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setNewDistributor({
      name: distributor.name,
      contact: distributor.contact,
      address: distributor.address,
      products: distributor.products
    });
    setIsAddingDistributor(true);
  };

  const resetDistributorForm = () => {
    setIsAddingDistributor(false);
    setSelectedDistributor(null);
    setNewDistributor({
      name: "",
      contact: "",
      address: "",
      products: []
    });
  };

  const resetProductForm = () => {
    setIsAddingProduct(false);
    setSelectedDistributor(null);
    setNewProduct({
      name: "",
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      price: 0
    });
  };

  const formatPrice = (amount: number) => {
    return `₹${Math.round(amount)}`;
  };

  const calculateTotalValue = (products: DistributionProduct[]) => {
    return products.reduce((total, product) => total + (product.price * product.quantity), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distribution Management</h1>
          <p className="text-muted-foreground">Manage your regular distributors that have provided more than 3 products</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleClearDistributors} 
            variant="outline"
          >
            Clear All
          </Button>
          <Button 
            onClick={() => { setIsAddingDistributor(true); setSelectedDistributor(null); }} 
            disabled={isAddingDistributor}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Distributor
          </Button>
        </div>
      </div>

      <DistributorSearch 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      {isAddingDistributor && (
        <DistributorForm
          newDistributor={newDistributor}
          selectedDistributor={selectedDistributor}
          handleInputChange={handleInputChange}
          handleAddDistributor={handleAddDistributor}
          handleUpdateDistributor={handleUpdateDistributor}
          onCancel={resetDistributorForm}
        />
      )}

      {filteredDistributors.length > 0 ? (
        <DistributorList
          distributors={filteredDistributors}
          selectedDistributor={selectedDistributor}
          isAddingProduct={isAddingProduct}
          newProduct={newProduct}
          handleEditDistributor={handleEditDistributor}
          handleDeleteDistributor={handleDeleteDistributor}
          setSelectedDistributor={setSelectedDistributor}
          setIsAddingProduct={setIsAddingProduct}
          handleProductInputChange={handleProductInputChange}
          handleAddProduct={handleAddProduct}
          handleDeleteProduct={handleDeleteProduct}
          formatPrice={formatPrice}
          calculateTotalValue={calculateTotalValue}
          resetProductForm={resetProductForm}
          isAddingDistributor={isAddingDistributor}
        />
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <div className="text-muted-foreground">
            {searchTerm 
              ? "No regular distributors found matching your search" 
              : "No regular distributors added yet (distributors must provide more than 3 products)"}
          </div>
        </div>
      )}
    </div>
  );
};

export default Distributors;
