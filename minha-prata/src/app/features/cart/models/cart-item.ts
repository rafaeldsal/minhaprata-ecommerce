import { Product } from "../../products/models/product";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: { [key: string]: string };
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemsCount: number;
}