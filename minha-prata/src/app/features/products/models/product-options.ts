import { ProductOption } from "./product";

// features/products/models/product-options.ts
export const PRODUCT_OPTIONS_BY_CATEGORY: {
  [key: string]: ProductOption[]
} = {
  aneis: [
    {
      name: 'Tamanho',
      values: ['16', '17', '18', '19']
    }
  ],
  braceletes: [
    {
      name: 'Tamanho',
      values: ['Pequeno', 'Médio', 'Grande']
    }
  ],
  colares: [
    {
      name: 'Comprimento',
      values: ['40cm', '45cm', '50cm']
    }
  ],
  brincos: [
    {
      name: 'Tipo',
      values: ['Argola', 'Pino', 'Pérola']
    }
  ]
};