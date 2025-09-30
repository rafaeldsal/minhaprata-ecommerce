export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  stockQuantity: number;
  dtCreated: string;
  dtUpdated: string;
  category: Category;
  options?: ProductOption[];
  inStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}
