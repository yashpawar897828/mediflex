
export interface DistributionProduct {
  id: number;
  name: string;
  date: string;
  quantity: number;
  price: number;
}

export interface Distributor {
  id: number;
  name: string;
  contact: string;
  address: string;
  products: DistributionProduct[];
}
