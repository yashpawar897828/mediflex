
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DistributorSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DistributorSearch = ({ searchTerm, setSearchTerm }: DistributorSearchProps) => {
  return (
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
  );
};

export default DistributorSearch;
