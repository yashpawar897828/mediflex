
import React from "react";
import { Buyer } from "@/types/buyers";
import BuyerCard from "./BuyerCard";
import EmptyBuyersList from "./EmptyBuyersList";

interface BuyersListProps {
  filteredBuyers: Buyer[];
  handleEditBuyer: (buyer: Buyer) => void;
  handleDeleteBuyer: (id: number) => void;
  isAddingBuyer: boolean;
  buyers: Buyer[];
  setBuyers: React.Dispatch<React.SetStateAction<Buyer[]>>;
}

const BuyersList = ({ 
  filteredBuyers, 
  handleEditBuyer, 
  handleDeleteBuyer,
  isAddingBuyer,
  buyers,
  setBuyers
}: BuyersListProps) => {
  return (
    <>
      {filteredBuyers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredBuyers.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              onEdit={handleEditBuyer}
              onDelete={handleDeleteBuyer}
              isAddingBuyer={isAddingBuyer}
              buyers={buyers}
              setBuyers={setBuyers}
            />
          ))}
        </div>
      ) : (
        <EmptyBuyersList />
      )}
    </>
  );
};

export default BuyersList;
