export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imgUrl: string; // ← Mantido para compatibilidade
  images?: ProductImage[]; // ← Novo campo opcional
  stockQuantity: number;
  dtCreated: string;
  dtUpdated: string;
  category: Category;
  options?: ProductOption[];
  inStock?: boolean;
  specifications?: ProductSpecification[];
  relatedProductsIds?: string[]; // IDs para produtos relacionados
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
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
