
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, User, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import BuyerPurchaseHistory from "./BuyerPurchaseHistory";
import AddPurchaseForm from "./AddPurchaseForm";
import { Buyer, BuyerPurchase } from "@/types/buyers";

interface BuyersListProps {
  filteredBuyers: Buyer[];
  handleEditBuyer: (buyer: Buyer) => void;
  handleDeleteBuyer: (id: number) => void;
  isAddingBuyer: boolean;
  clearBuyers?: () => void;
}

const BuyersList = ({ 
  filteredBuyers, 
  handleEditBuyer, 
  handleDeleteBuyer,
  isAddingBuyer,
  clearBuyers
}: BuyersListProps) => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [newPurchase, setNewPurchase] = useState<Omit<BuyerPurchase, 'id'>>({
    medicine: "",
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0
  });
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  // Load buyers from localStorage
  useState(() => {
    const savedBuyers = localStorage.getItem('regularBuyers');
    if (savedBuyers) {
      setBuyers(JSON.parse(savedBuyers));
    } else {
      setBuyers([]);
      localStorage.setItem('regularBuyers', JSON.stringify([]));
    }
  });

  // Save buyers to localStorage when updated
  useState(() => {
    if (buyers.length) {
      localStorage.setItem('regularBuyers', JSON.stringify(buyers));
    }
  });

  const handlePurchaseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPurchase(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleAddPurchase = () => {
    if (!selectedBuyer || !newPurchase.medicine) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const purchaseId = Math.max(0, ...selectedBuyer.purchases.map(p => p.id), 0) + 1;
    
    setBuyers(prev => 
      prev.map(buyer => 
        buyer.id === selectedBuyer.id 
          ? { 
              ...buyer, 
              purchases: [...buyer.purchases, { id: purchaseId, ...newPurchase }]
            } 
          : buyer
      )
    );
    
    setNewPurchase({
      medicine: "",
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      price: 0
    });
    
    setIsAddingPurchase(false);
    toast.success("Purchase record added successfully");
  };

  const handleDeletePurchase = (buyerId: number, purchaseId: number) => {
    setBuyers(prev => 
      prev.map(buyer => 
        buyer.id === buyerId 
          ? { 
              ...buyer, 
              purchases: buyer.purchases.filter(p => p.id !== purchaseId)
            } 
          : buyer
      )
    );
    
    toast.success("Purchase record deleted successfully");
  };

  const formatPrice = (amount: number) => {
    return `₹${Math.round(amount)}`;
  };

  const calculateTotalSpend = (purchases: BuyerPurchase[]) => {
    return purchases.reduce((total, purchase) => total + (purchase.price * purchase.quantity), 0);
  };

  return (
    <>
      {filteredBuyers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" /> {buyer.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" /> {buyer.contact}
                    </div>
                    {buyer.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{buyer.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditBuyer(buyer)}
                      disabled={isAddingBuyer}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteBuyer(buyer.id)}
                      disabled={isAddingBuyer}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Purchase History</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        Total spend: <span className="font-bold">{formatPrice(calculateTotalSpend(buyer.purchases))}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => { 
                          setSelectedBuyer(buyer); 
                          setIsAddingPurchase(true); 
                        }}
                        disabled={isAddingPurchase}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Purchase
                      </Button>
                    </div>
                  </div>

                  {isAddingPurchase && selectedBuyer?.id === buyer.id && (
                    <AddPurchaseForm
                      newPurchase={newPurchase}
                      handlePurchaseInputChange={handlePurchaseInputChange}
                      handleAddPurchase={handleAddPurchase}
                      onCancel={() => {
                        setIsAddingPurchase(false);
                        setSelectedBuyer(null);
                        setNewPurchase({
                          medicine: "",
                          date: new Date().toISOString().split('T')[0],
                          quantity: 1,
                          price: 0
                        });
                      }}
                    />
                  )}

                  <BuyerPurchaseHistory 
                    purchases={buyer.purchases}
                    formatPrice={formatPrice}
                    onDeletePurchase={(purchaseId) => handleDeletePurchase(buyer.id, purchaseId)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <div className="text-muted-foreground">
            No buyers found matching your search
          </div>
        </div>
      )}
    </>
  );
};

export default BuyersList;
