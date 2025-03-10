import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, User, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import BuyerPurchaseHistory from "./BuyerPurchaseHistory";
import AddPurchaseForm from "./AddPurchaseForm";
import { Buyer, BuyerPurchase } from "@/types/buyers";
import { formatPrice, calculateTotalSpend, isRegularBuyer } from "@/utils/buyerUtils";

interface BuyerCardProps {
  buyer: Buyer;
  onEdit: (buyer: Buyer) => void;
  onDelete: (id: number) => void;
  isAddingBuyer: boolean;
  buyers: Buyer[];
  setBuyers: React.Dispatch<React.SetStateAction<Buyer[]>>;
}

const BuyerCard = ({ 
  buyer, 
  onEdit, 
  onDelete, 
  isAddingBuyer,
  buyers,
  setBuyers
}: BuyerCardProps) => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [newPurchase, setNewPurchase] = useState<Omit<BuyerPurchase, 'id'>>({
    medicine: "",
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0
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
    
    const purchaseId = selectedBuyer.purchases.length > 0 
      ? Math.max(...selectedBuyer.purchases.map(p => p.id)) + 1 
      : 1;
    
    const updatedBuyers = buyers.map(b => 
      b.id === selectedBuyer.id 
        ? { 
            ...b, 
            purchases: [...b.purchases, { id: purchaseId, ...newPurchase }]
          } 
        : b
    );
    
    setBuyers(updatedBuyers);
    
    const updatedBuyer = updatedBuyers.find(b => b.id === selectedBuyer.id);
    if (updatedBuyer && isRegularBuyer(updatedBuyer.purchases) && !isRegularBuyer(selectedBuyer.purchases)) {
      toast.success(`${updatedBuyer.name} is now a regular buyer!`);
    }
    
    setNewPurchase({
      medicine: "",
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      price: 0
    });
    
    setIsAddingPurchase(false);
    toast.success("Purchase record added successfully");
  };

  const handleDeletePurchase = (purchaseId: number) => {
    setBuyers(prev => 
      prev.map(b => 
        b.id === buyer.id 
          ? { 
              ...b, 
              purchases: b.purchases.filter(p => p.id !== purchaseId)
            } 
          : b
      )
    );
    
    toast.success("Purchase record deleted successfully");
  };

  return (
    <Card>
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
              onClick={() => onEdit(buyer)}
              disabled={isAddingBuyer}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(buyer.id)}
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
            onDeletePurchase={handleDeletePurchase}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerCard;
