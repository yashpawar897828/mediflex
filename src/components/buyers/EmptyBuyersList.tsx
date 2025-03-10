
import React from "react";

const EmptyBuyersList = () => {
  return (
    <div className="text-center py-10 border rounded-md bg-muted/10">
      <div className="text-muted-foreground">
        No buyers found matching your search
      </div>
    </div>
  );
};

export default EmptyBuyersList;
