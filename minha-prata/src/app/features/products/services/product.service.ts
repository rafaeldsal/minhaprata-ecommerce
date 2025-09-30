import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { Observable, of } from 'rxjs';
import { PRODUCT_OPTIONS_BY_CATEGORY } from '../models/product-options';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private enhanceProductWithOptions(product: Product): Product {
    return {
      ...product,
      inStock: product.stockQuantity > 0,
      options: PRODUCT_OPTIONS_BY_CATEGORY[product.category.name] || []
    };
  }

  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Anel Solitário',
      description: 'Anel em prata 925 com pedra solitária.',
      price: 199.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 10,
      dtCreated: '2024-01-01T00:00:00',
      dtUpdated: '2024-01-01T00:00:00',
      category: {
        id: '1',
        name: 'aneis',
        description: 'Anéis em prata'
      }
    },
    {
      id: '2',
      name: 'Anel Coração Vazado',
      description: 'Anel delicado em prata 925 com formato de coração.',
      price: 149.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 15,
      dtCreated: '2024-01-05T00:00:00',
      dtUpdated: '2024-01-05T00:00:00',
      category: {
        id: '1',
        name: 'aneis',
        description: 'Anéis em prata'
      }
    },
    {
      id: '3',
      name: 'Anel Trançado',
      description: 'Anel em prata 925 com design trançado.',
      price: 179.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 8,
      dtCreated: '2024-01-10T00:00:00',
      dtUpdated: '2024-01-10T00:00:00',
      category: {
        id: '1',
        name: 'aneis',
        description: 'Anéis em prata'
      }
    },
    {
      id: '4',
      name: 'Bracelete Minimalista',
      description: 'Bracelete em prata 925 estilo minimalista.',
      price: 220.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 12,
      dtCreated: '2024-01-12T00:00:00',
      dtUpdated: '2024-01-12T00:00:00',
      category: {
        id: '2',
        name: 'braceletes',
        description: 'Braceletes em prata'
      }
    },
    {
      id: '5',
      name: 'Bracelete Aberto',
      description: 'Bracelete ajustável em prata 925.',
      price: 250.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 9,
      dtCreated: '2024-01-15T00:00:00',
      dtUpdated: '2024-01-15T00:00:00',
      category: {
        id: '2',
        name: 'braceletes',
        description: 'Braceletes em prata'
      }
    },
    {
      id: '6',
      name: 'Bracelete Trabalhado',
      description: 'Bracelete em prata 925 com detalhes artesanais.',
      price: 280.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 6,
      dtCreated: '2024-01-20T00:00:00',
      dtUpdated: '2024-01-20T00:00:00',
      category: {
        id: '2',
        name: 'braceletes',
        description: 'Braceletes em prata'
      }
    },
    {
      id: '7',
      name: 'Colar Ponto de Luz',
      description: 'Colar em prata 925 com pedra central brilhante.',
      price: 199.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 20,
      dtCreated: '2024-01-22T00:00:00',
      dtUpdated: '2024-01-22T00:00:00',
      category: {
        id: '3',
        name: 'colares',
        description: 'Colares em prata'
      }
    },
    {
      id: '8',
      name: 'Colar Coração',
      description: 'Colar em prata 925 com pingente de coração.',
      price: 210.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 18,
      dtCreated: '2024-01-25T00:00:00',
      dtUpdated: '2024-01-25T00:00:00',
      category: {
        id: '3',
        name: 'colares',
        description: 'Colares em prata'
      }
    },
    {
      id: '9',
      name: 'Colar Medalhão',
      description: 'Colar em prata 925 com medalhão clássico.',
      price: 260.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 7,
      dtCreated: '2024-01-28T00:00:00',
      dtUpdated: '2024-01-28T00:00:00',
      category: {
        id: '3',
        name: 'colares',
        description: 'Colares em prata'
      }
    },
    {
      id: '10',
      name: 'Brinco Argola Pequena',
      description: 'Brinco em prata 925 em formato de argola pequena.',
      price: 130.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 25,
      dtCreated: '2024-02-01T00:00:00',
      dtUpdated: '2024-02-01T00:00:00',
      category: {
        id: '4',
        name: 'brincos',
        description: 'Brincos em prata'
      }
    },
    {
      id: '11',
      name: 'Brinco Ponto de Luz',
      description: 'Brinco pequeno em prata 925 com pedra brilhante.',
      price: 150.0,
      imgUrl: 'https://via.placeholder.com/300x300',
      stockQuantity: 22,
      dtCreated: '2024-02-05T00:00:00',
      dtUpdated: '2024-02-05T00:00:00',
      category: {
        id: '4',
        name: 'brincos',
        description: 'Brincos em prata'
      }
    }
  ];


  constructor() { }

  getAll(): Observable<Product[]> {
    const enhancedProducts = this.mockProducts.map(p =>
      this.enhanceProductWithOptions(p)
    );

    return of(enhancedProducts)
  }

  getByCategory(category: string): Observable<Product[]> {
    if (category === 'all') {
      return this.getAll();
    }

    const filtered = this.mockProducts
      .filter(p => p.category.name === category)
      .map(p => this.enhanceProductWithOptions(p));

    return of(filtered);
  }


  getById(id: string): Observable<Product | undefined> {
    const product = this.mockProducts.find(p => p.id === id);
    return of(product);
  }

  search(term: string): Observable<Product[]> {
    const lowerTerm = term.toLowerCase();
    if (!lowerTerm.trim()) {
      return this.getAll();
    }
    const filtered = this.mockProducts
      .filter(p => p.name.toLowerCase().includes(lowerTerm) ||
        p.description.toLowerCase().includes(lowerTerm))
      .map(p => this.enhanceProductWithOptions(p));

    return of(filtered);
  }

}

