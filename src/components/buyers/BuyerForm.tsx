
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Buyer } from "@/types/buyers";

interface BuyerFormProps {
  newBuyer: Omit<Buyer, 'id' | 'purchases'>;
  selectedBuyer: Buyer | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddBuyer: () => void;
  handleUpdateBuyer: () => void;
  onCancel: () => void;
}

const BuyerForm = ({
  newBuyer,
  selectedBuyer,
  handleInputChange,
  handleAddBuyer,
  handleUpdateBuyer,
  onCancel
}: BuyerFormProps) => {
  return (
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
              onClick={onCancel}
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
  );
};

export default BuyerForm;
