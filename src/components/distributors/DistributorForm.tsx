
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Distributor } from "@/types/distributors";

interface DistributorFormProps {
  newDistributor: Omit<Distributor, 'id'>;
  selectedDistributor: Distributor | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddDistributor: () => void;
  handleUpdateDistributor: () => void;
  onCancel: () => void;
}

const DistributorForm = ({
  newDistributor,
  selectedDistributor,
  handleInputChange,
  handleAddDistributor,
  handleUpdateDistributor,
  onCancel
}: DistributorFormProps) => {
  return (
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
              onClick={onCancel}
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
  );
};

export default DistributorForm;
