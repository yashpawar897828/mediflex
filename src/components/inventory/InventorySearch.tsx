
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const InventorySearch: React.FC<InventorySearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 mb-6 relative">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10"
        />
      </div>
    </div>
  );
};

export default InventorySearch;
