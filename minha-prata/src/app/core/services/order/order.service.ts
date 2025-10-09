// src/app/user/services/order.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { UserOrder, OrdersResponse, OrderStatus, OrderItem } from '../../models/order.types';
import { Product } from 'src/app/features/products/models/product';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private mockOrders: UserOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: new Date('2024-01-15'),
      status: 'delivered',
      total: 299.97,
      trackingCode: 'TRK123456789',
      estimatedDelivery: new Date('2024-01-20'),
      items: [
        {
          id: 'item1',
          productId: 'prod1',
          productName: 'Camiseta Basic',
          productImage: 'https://via.placeholder.com/80',
          quantity: 2,
          price: 49.99,
          size: 'M',
          color: 'Preto'
        },
        {
          id: 'item2',
          productId: 'prod2',
          productName: 'Calça Jeans',
          productImage: 'https://via.placeholder.com/80',
          quantity: 1,
          price: 199.99,
          size: '42',
          color: 'Azul'
        }
      ],
      shippingAddress: {
        id: 'addr1',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      }
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: new Date('2024-01-10'),
      status: 'shipped',
      total: 159.98,
      trackingCode: 'TRK987654321',
      estimatedDelivery: new Date('2024-01-18'),
      items: [
        {
          id: 'item3',
          productId: 'prod3',
          productName: 'Tênis Esportivo',
          productImage: 'https://via.placeholder.com/80',
          quantity: 1,
          price: 159.98,
          size: '42',
          color: 'Branco'
        }
      ],
      shippingAddress: {
        id: 'addr1',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      }
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: new Date('2024-01-05'),
      status: 'pending',
      total: 89.97,
      items: [
        {
          id: 'item4',
          productId: 'prod4',
          productName: 'Meias Pack',
          productImage: 'https://via.placeholder.com/80',
          quantity: 3,
          price: 29.99,
          size: 'Único',
          color: 'Cinza'
        }
      ],
      shippingAddress: {
        id: 'addr2',
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      }
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      date: new Date('2024-01-02'),
      status: 'cancelled',
      total: 199.99,
      items: [
        {
          id: 'item5',
          productId: 'prod5',
          productName: 'Jaqueta Corta Vento',
          productImage: 'https://via.placeholder.com/80',
          quantity: 1,
          price: 199.99,
          size: 'L',
          color: 'Verde'
        }
      ],
      shippingAddress: {
        id: 'addr1',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      }
    }
  ];

  getOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus | 'all'
  ): Observable<OrdersResponse> {
    let filteredOrders = this.mockOrders;

    if (status && status !== 'all') {
      filteredOrders = this.mockOrders.filter(order => order.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const response: OrdersResponse = {
      orders: paginatedOrders,
      total: filteredOrders.length,
      page,
      limit,
      hasNext: endIndex < filteredOrders.length
    };

    return of(response).pipe(delay(500));
  }

  getOrderById(orderId: string): Observable<UserOrder | null> {
    const order = this.mockOrders.find(o => o.id === orderId) || null;
    return of(order).pipe(delay(300));
  }

  reorder(orderId: string): Observable<boolean> {
    const order = this.mockOrders.find(o => o.id === orderId);

    if (!order) {
      return of(false);
    }

    // Simula adicionar itens ao carrinho
    console.log('Adicionando itens ao carrinho:', order.items);

    // Aqui você integraria com o serviço de carrinho real
    // Por enquanto, vamos simular sucesso
    return of(true).pipe(delay(1000));
  }

  // Método para obter os itens do pedido (útil para o carrinho)
  getOrderItemsForReorder(orderId: string): OrderItem[] {
    const order = this.mockOrders.find(o => o.id === orderId);
    return order ? order.items : [];
  }

  getProductsForReorder(orderId: string): { product: Product, quantity: number, selectedOptions?: { [key: string]: string } }[] {
    const order = this.mockOrders.find(o => o.id === orderId);

    if (!order) return [];

    return order.items.map(item => {
      // Cria um objeto que satisfaça TODAS as propriedades obrigatórias do Product
      const productData = {
        id: item.productId,
        name: item.productName,
        description: `Produto: ${item.productName} - Pedido: ${order.orderNumber}`,
        price: item.price,
        imgUrl: item.productImage,
        images: [item.productImage],
        stockQuantity: 15,
        dtCreated: '2024-01-01T00:00:00.000Z',
        dtUpdated: new Date().toISOString(),
        category: {
          id: 'cat-1',
          name: 'Categoria Principal',
          description: 'Descrição da categoria',
          dtCreated: '2024-01-01T00:00:00.000Z',
          dtUpdated: '2024-01-01T00:00:00.000Z'
        },
        inStock: true,
        options: this.generateProductOptions(item)
      };

      // Cast explícito para Product
      const product = productData as unknown as Product;

      const selectedOptions: { [key: string]: string } = {};
      if (item.size) selectedOptions['size'] = item.size;
      if (item.color) selectedOptions['color'] = item.color;

      return {
        product,
        quantity: item.quantity,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
      };
    });
  }

  private generateProductOptions(item: OrderItem): any[] {
    const options = [];

    if (item.size) {
      options.push({
        name: 'Tamanho',
        values: [item.size, 'P', 'M', 'G', 'GG'],
        required: true
      });
    }

    if (item.color) {
      options.push({
        name: 'Cor',
        values: [item.color, 'Preto', 'Branco', 'Vermelho'],
        required: true
      });
    }

    return options;
  }
}