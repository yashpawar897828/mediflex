import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Truck, Phone, Package } from "lucide-react";
import { toast } from "sonner";

interface DistributionProduct {
  id: number;
  name: string;
  date: string;
  quantity: number;
  price: number;
}

interface Distributor {
  id: number;
  name: string;
  contact: string;
  address: string;
  products: DistributionProduct[];
}

const sampleDistributors: Distributor[] = [
  {
    id: 1,
    name: "MedSupply Co.",
    contact: "+1 (555) 234-5678",
    address: "123 Medical Plaza, Suite 300, Boston, MA 02115",
    products: [
      { id: 1, name: "Paracetamol 500mg", date: "2024-01-10", quantity: 500, price: 4.25 },
      { id: 2, name: "Vitamin C 1000mg", date: "2024-01-15", quantity: 300, price: 6.75 }
    ]
  },
  {
    id: 2,
    name: "Pharma Distributors Inc.",
    contact: "+1 (555) 876-5432",
    address: "456 Healthcare Blvd, Chicago, IL 60601",
    products: [
      { id: 3, name: "Antibiotic Solution 250ml", date: "2024-02-01", quantity: 100, price: 18.50 },
      { id: 4, name: "Insulin Pens", date: "2024-02-05", quantity: 50, price: 65.25 }
    ]
  }
];

const Distributors = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [isAddingDistributor, setIsAddingDistributor] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const [newDistributor, setNewDistributor] = useState<Omit<Distributor, 'id' | 'products'>>({
    name: "",
    contact: "",
    address: ""
  });
  
  const [newProduct, setNewProduct] = useState<Omit<DistributionProduct, 'id'>>({
    name: "",
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0
  });

  useEffect(() => {
    const savedDistributors = localStorage.getItem('distributors');
    if (savedDistributors) {
      setDistributors(JSON.parse(savedDistributors));
    } else {
      setDistributors(sampleDistributors);
      localStorage.setItem('distributors', JSON.stringify(sampleDistributors));
    }
  }, []);

  useEffect(() => {
    if (distributors.length) {
      localStorage.setItem('distributors', JSON.stringify(distributors));
    }
  }, [distributors]);

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
    
    const distributorId = Math.max(0, ...distributors.map(distributor => distributor.id)) + 1;
    
    setDistributors(prev => [
      ...prev,
      { id: distributorId, ...newDistributor, products: [] }
    ]);
    
    setNewDistributor({
      name: "",
      contact: "",
      address: ""
    });
    
    setIsAddingDistributor(false);
    toast.success("Distributor added successfully");
  };

  const handleUpdateDistributor = () => {
    if (!selectedDistributor) return;
    
    setDistributors(prev => 
      prev.map(distributor => 
        distributor.id === selectedDistributor.id 
          ? { ...distributor, name: newDistributor.name, contact: newDistributor.contact, address: newDistributor.address } 
          : distributor
      )
    );
    
    setSelectedDistributor(null);
    setNewDistributor({
      name: "",
      contact: "",
      address: ""
    });
    
    toast.success("Distributor updated successfully");
  };

  const handleDeleteDistributor = (id: number) => {
    setDistributors(prev => prev.filter(distributor => distributor.id !== id));
    toast.success("Distributor deleted successfully");
  };

  const handleAddProduct = () => {
    if (!selectedDistributor || !newProduct.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const productId = Math.max(0, ...selectedDistributor.products.map(p => p.id), 0) + 1;
    
    setDistributors(prev => 
      prev.map(distributor => 
        distributor.id === selectedDistributor.id 
          ? { 
              ...distributor, 
              products: [...distributor.products, { id: productId, ...newProduct }]
            } 
          : distributor
      )
    );
    
    setNewProduct({
      name: "",
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      price: 0
    });
    
    setIsAddingProduct(false);
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
    
    toast.success("Product deleted successfully");
  };

  const handleEditDistributor = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setNewDistributor({
      name: distributor.name,
      contact: distributor.contact,
      address: distributor.address
    });
    setIsAddingDistributor(true);
  };

  const formatPrice = (amount: number) => {
    return Math.round(amount);
  };

  const calculateTotalValue = (products: DistributionProduct[]) => {
    return products.reduce((total, product) => total + (product.price * product.quantity), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distribution Management</h1>
          <p className="text-muted-foreground">Manage your distributors and their products</p>
        </div>
        <Button onClick={() => { setIsAddingDistributor(true); setSelectedDistributor(null); }} disabled={isAddingDistributor}>
          <Plus className="mr-2 h-4 w-4" /> Add Distributor
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search distributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      {isAddingDistributor && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedDistributor ? "Edit Distributor" : "Add New Distributor"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Distributor Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newDistributor.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={newDistributor.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={newDistributor.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingDistributor(false);
                    setSelectedDistributor(null);
                    setNewDistributor({
                      name: "",
                      contact: "",
                      address: ""
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={selectedDistributor ? handleUpdateDistributor : handleAddDistributor}>
                  {selectedDistributor ? "Update" : "Add"} Distributor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredDistributors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredDistributors.map((distributor) => (
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
                    <Card className="border border-muted p-4">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="product-name">Product Name *</Label>
                            <Input
                              id="product-name"
                              name="name"
                              value={newProduct.name}
                              onChange={handleProductInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date">Distribution Date</Label>
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              value={newProduct.date}
                              onChange={handleProductInputChange}
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
                              value={newProduct.quantity}
                              onChange={handleProductInputChange}
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
                              value={newProduct.price}
                              onChange={handleProductInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingProduct(false);
                              setSelectedDistributor(null);
                              setNewProduct({
                                name: "",
                                date: new Date().toISOString().split('T')[0],
                                quantity: 1,
                                price: 0
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleAddProduct}>
                            Add Product
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {distributor.products.length > 0 ? (
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
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <div className="text-muted-foreground">
            {searchTerm ? "No distributors found matching your search" : "No distributors added yet"}
          </div>
        </div>
      )}
    </div>
  );
};

export default Distributors;
