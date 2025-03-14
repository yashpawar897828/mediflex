import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { dashboardService } from "@/services/DashboardService";
import BuyerSearch from "@/components/buyers/BuyerSearch";
import BuyerForm from "@/components/buyers/BuyerForm";
import BuyersList from "@/components/buyers/BuyersList";
import { Buyer } from "@/types/buyers";
import { isRegularBuyer } from "@/utils/buyerUtils";

const BUYERS_STORAGE_KEY = 'regularBuyers';

const RegularBuyers = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  
  const [newBuyer, setNewBuyer] = useState<Omit<Buyer, 'id' | 'purchases'>>({
    name: "",
    contact: "",
    notes: ""
  });

  useEffect(() => {
    loadBuyers();
  }, []);

  useEffect(() => {
    if (buyers.length) {
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(buyers));
    }
  }, [buyers]);

  const loadBuyers = () => {
    const savedBuyers = localStorage.getItem(BUYERS_STORAGE_KEY);
    if (savedBuyers) {
      const allBuyers: Buyer[] = JSON.parse(savedBuyers);
      const regularBuyers = allBuyers.filter(buyer => isRegularBuyer(buyer.purchases));
      setBuyers(regularBuyers);
    } else {
      setBuyers([]);
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify([]));
    }
  };

  const clearBuyers = () => {
    localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify([]));
    setBuyers([]);
    toast.success("All buyers cleared successfully");
  };

  const filteredBuyers = buyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBuyer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBuyer = () => {
    if (!newBuyer.name || !newBuyer.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const buyerId = buyers.length > 0 ? Math.max(...buyers.map(buyer => buyer.id)) + 1 : 1;
    const newBuyerRecord = { id: buyerId, ...newBuyer, purchases: [] };
    
    setBuyers(prev => [...prev, newBuyerRecord]);
    
    setNewBuyer({
      name: "",
      contact: "",
      notes: ""
    });
    
    setIsAddingBuyer(false);
    toast.success("Buyer added successfully");
    
    dashboardService.addActivity('distribution', `Added new buyer: ${newBuyer.name}`);
  };

  const handleUpdateBuyer = () => {
    if (!selectedBuyer) return;
    
    setBuyers(prev => 
      prev.map(buyer => 
        buyer.id === selectedBuyer.id 
          ? { ...buyer, name: newBuyer.name, contact: newBuyer.contact, notes: newBuyer.notes } 
          : buyer
      )
    );
    
    setSelectedBuyer(null);
    setNewBuyer({
      name: "",
      contact: "",
      notes: ""
    });
    
    setIsAddingBuyer(false);
    toast.success("Buyer updated successfully");
  };

  const handleDeleteBuyer = (id: number) => {
    setBuyers(prev => prev.filter(buyer => buyer.id !== id));
    toast.success("Buyer deleted successfully");
  };

  const handleEditBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setNewBuyer({
      name: buyer.name,
      contact: buyer.contact,
      notes: buyer.notes
    });
    setIsAddingBuyer(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regular Buyers</h1>
          <p className="text-muted-foreground">Manage your regular customers that have purchased more than 3 times</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearBuyers} variant="outline">
            Clear All
          </Button>
          <Button onClick={() => { setIsAddingBuyer(true); setSelectedBuyer(null); }} disabled={isAddingBuyer}>
            <Plus className="mr-2 h-4 w-4" /> Add Buyer
          </Button>
        </div>
      </div>

      <BuyerSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {isAddingBuyer && (
        <BuyerForm
          newBuyer={newBuyer}
          selectedBuyer={selectedBuyer}
          handleInputChange={handleInputChange}
          handleAddBuyer={handleAddBuyer}
          handleUpdateBuyer={handleUpdateBuyer}
          onCancel={() => {
            setIsAddingBuyer(false);
            setSelectedBuyer(null);
            setNewBuyer({
              name: "",
              contact: "",
              notes: ""
            });
          }}
        />
      )}

      <BuyersList
        filteredBuyers={filteredBuyers}
        handleEditBuyer={handleEditBuyer}
        handleDeleteBuyer={handleDeleteBuyer}
        isAddingBuyer={isAddingBuyer}
        buyers={buyers}
        setBuyers={setBuyers}
      />
    </div>
  );
};

export default RegularBuyers;
