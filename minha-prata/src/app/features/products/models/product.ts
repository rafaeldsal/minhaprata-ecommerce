export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  images?: string[];
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

export function getProductImages(product: Product): string[] {
  // Prioridade 1: Array images
  if (product.images && product.images.length > 0) {
    return product.images;
  }

  // Prioridade 2: imgUrl splitada (fallback temporário)
  if (product.imgUrl && product.imgUrl.includes(';')) {
    return product.imgUrl.split(';').filter(url => url.trim());
  }

  // Prioridade 3: imgUrl única
  return [product.imgUrl];
}
