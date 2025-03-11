
import React from "react";
import { OrderReceiptData } from "@/types/distributors";

interface OrderReceiptDisplayProps {
  orderData: OrderReceiptData | null;
}

const OrderReceiptDisplay = ({ orderData }: OrderReceiptDisplayProps) => {
  if (!orderData) return null;

  return (
    <div className="mt-4 border rounded-md p-4 bg-muted/20">
      <h3 className="font-medium mb-2">Order Receipt Information:</h3>
      
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Distributor:</p>
            <p>{orderData.distributorName || "Not detected"}</p>
          </div>
          <div>
            <p className="font-medium">Contact:</p>
            <p>{orderData.distributorContact || "Not detected"}</p>
          </div>
          <div>
            <p className="font-medium">Receipt ID:</p>
            <p>{orderData.receiptId || "Not detected"}</p>
          </div>
          <div>
            <p className="font-medium">Date:</p>
            <p>{orderData.date ? new Date(orderData.date).toLocaleDateString() : "Not detected"}</p>
          </div>
        </div>
      </div>
      
      <h4 className="font-medium mt-3 mb-2">Products:</h4>
      {orderData.products.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {orderData.products.map((product, index) => (
            <div key={index} className="p-2 bg-background rounded-md border">
              <div className="flex justify-between">
                <span className="font-medium">{product.name}</span>
                <span>${product.price?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="grid grid-cols-2 text-sm text-muted-foreground">
                <div>Quantity: {product.quantity || 1}</div>
                {product.batch && <div>Batch: {product.batch}</div>}
              </div>
              {product.expiry && (
                <div className="text-sm text-muted-foreground">
                  Expiry: {new Date(product.expiry).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No products detected in receipt</p>
      )}
    </div>
  );
};

export default OrderReceiptDisplay;
