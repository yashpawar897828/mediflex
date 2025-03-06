import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, User, Phone } from "lucide-react";
import { toast } from "sonner";

interface BuyerPurchase {
  id: number;
  medicine: string;
  date: string;
  quantity: number;
  price: number;
}

interface Buyer {
  id: number;
  name: string;
  contact: string;
  notes: string;
  purchases: BuyerPurchase[];
}

const sampleBuyers: Buyer[] = [
  {
    id: 1,
    name: "John Smith",
    contact: "+1 (555) 123-4567",
    notes: "Monthly customer for blood pressure medication",
    purchases: [
      { id: 1, medicine: "Lisinopril 10mg", date: "2023-12-15", quantity: 30, price: 15.99 },
      { id: 2, medicine: "Aspirin 81mg", date: "2023-12-15", quantity: 60, price: 8.49 }
    ]
  },
  {
    id: 2,
    name: "Sarah Johnson",
    contact: "+1 (555) 987-6543",
    notes: "Diabetic patient, needs regular insulin",
    purchases: [
      { id: 3, medicine: "Insulin Glargine", date: "2024-01-05", quantity: 5, price: 125.00 },
      { id: 4, medicine: "Glucose Test Strips", date: "2024-01-05", quantity: 100, price: 65.99 }
    ]
  }
];

const RegularBuyers = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  
  const [newBuyer, setNewBuyer] = useState<Omit<Buyer, 'id' | 'purchases'>>({
    name: "",
    contact: "",
    notes: ""
  });
  
  const [newPurchase, setNewPurchase] = useState<Omit<BuyerPurchase, 'id'>>({
    medicine: "",
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0
  });

  useEffect(() => {
    const savedBuyers = localStorage.getItem('regularBuyers');
    if (savedBuyers) {
      setBuyers(JSON.parse(savedBuyers));
    } else {
      setBuyers(sampleBuyers);
      localStorage.setItem('regularBuyers', JSON.stringify(sampleBuyers));
    }
  }, []);

  useEffect(() => {
    if (buyers.length) {
      localStorage.setItem('regularBuyers', JSON.stringify(buyers));
    }
  }, [buyers]);

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

  const handlePurchaseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPurchase(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleAddBuyer = () => {
    if (!newBuyer.name || !newBuyer.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const buyerId = Math.max(0, ...buyers.map(buyer => buyer.id)) + 1;
    
    setBuyers(prev => [
      ...prev,
      { id: buyerId, ...newBuyer, purchases: [] }
    ]);
    
    setNewBuyer({
      name: "",
      contact: "",
      notes: ""
    });
    
    setIsAddingBuyer(false);
    toast.success("Buyer added successfully");
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
    
    toast.success("Buyer updated successfully");
  };

  const handleDeleteBuyer = (id: number) => {
    setBuyers(prev => prev.filter(buyer => buyer.id !== id));
    toast.success("Buyer deleted successfully");
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

  const handleEditBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setNewBuyer({
      name: buyer.name,
      contact: buyer.contact,
      notes: buyer.notes
    });
    setIsAddingBuyer(true);
  };

  const formatPrice = (amount: number) => {
    return Math.round(amount);
  };

  const calculateTotalSpend = (purchases: BuyerPurchase[]) => {
    return purchases.reduce((total, purchase) => total + (purchase.price * purchase.quantity), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regular Buyers</h1>
          <p className="text-muted-foreground">Manage your regular customers and their purchases</p>
        </div>
        <Button onClick={() => { setIsAddingBuyer(true); setSelectedBuyer(null); }} disabled={isAddingBuyer}>
          <Plus className="mr-2 h-4 w-4" /> Add Buyer
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buyers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      {isAddingBuyer && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedBuyer ? "Edit Buyer" : "Add New Buyer"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Buyer Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newBuyer.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={newBuyer.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newBuyer.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingBuyer(false);
                    setSelectedBuyer(null);
                    setNewBuyer({
                      name: "",
                      contact: "",
                      notes: ""
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={selectedBuyer ? handleUpdateBuyer : handleAddBuyer}>
                  {selectedBuyer ? "Update" : "Add"} Buyer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <Card className="border border-muted p-4">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="medicine">Medicine Name *</Label>
                            <Input
                              id="medicine"
                              name="medicine"
                              value={newPurchase.medicine}
                              onChange={handlePurchaseInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date">Purchase Date</Label>
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              value={newPurchase.date}
                              onChange={handlePurchaseInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              name="quantity"
                              type="number"
                              min="1"
                              value={newPurchase.quantity}
                              onChange={handlePurchaseInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Price per Unit</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={newPurchase.price}
                              onChange={handlePurchaseInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingPurchase(false);
                              setSelectedBuyer(null);
                              setNewPurchase({
                                medicine: "",
                                date: new Date().toISOString().split('T')[0],
                                quantity: 1,
                                price: 0
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleAddPurchase}>
                            Add Purchase
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {buyer.purchases.length > 0 ? (
                    <div className="border rounded-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="py-2 px-4 text-left font-medium">Medicine</th>
                              <th className="py-2 px-4 text-left font-medium">Date</th>
                              <th className="py-2 px-4 text-left font-medium">Qty</th>
                              <th className="py-2 px-4 text-left font-medium">Price</th>
                              <th className="py-2 px-4 text-left font-medium">Total</th>
                              <th className="py-2 px-4 text-left font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {buyer.purchases.map((purchase) => (
                              <tr key={purchase.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-4">{purchase.medicine}</td>
                                <td className="py-2 px-4">{new Date(purchase.date).toLocaleDateString()}</td>
                                <td className="py-2 px-4">{purchase.quantity}</td>
                                <td className="py-2 px-4">{formatPrice(purchase.price)}</td>
                                <td className="py-2 px-4">{formatPrice(purchase.price * purchase.quantity)}</td>
                                <td className="py-2 px-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePurchase(buyer.id, purchase.id)}
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
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No purchase history available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <div className="text-muted-foreground">
            {searchTerm ? "No buyers found matching your search" : "No buyers added yet"}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularBuyers;
