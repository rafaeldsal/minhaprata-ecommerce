// src/app/core/services/data/order-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { UserOrder, OrdersResponse, OrderStatus, OrderItem, CreateOrderData, OrderHelper } from '../../models/order/order.model';
import { Product } from '../../models/product/product.model';
import { UserAddress, AddressHelper } from '../../models/shared/address.model';
import { CartService } from '../business/cart.service';
import { NotificationService } from '../shared/notification.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDataService {
  private readonly ORDERS_STORAGE_KEY = 'minhaprata_orders';
  private mockOrders: UserOrder[];

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService
  ) {
    this.mockOrders = this.loadOrdersFromStorage() || this.createMockOrders();
  }

  // ========== 📦 MÉTODOS PÚBLICOS PRINCIPAIS ==========

  /**
   * Obtém pedidos com paginação e filtros
   */
  getOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus | 'all'
  ): Observable<OrdersResponse> {
    let filteredOrders = this.mockOrders;

    // Aplica filtro de status
    if (status && status !== 'all') {
      filteredOrders = OrderHelper.filterOrdersByStatus(this.mockOrders, status);
    }

    // Ordena por data (mais recente primeiro)
    filteredOrders = OrderHelper.sortOrdersByDate(filteredOrders, false);

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

  /**
   * Obtém pedido por ID
   */
  getOrderById(orderId: string): Observable<UserOrder | null> {
    const order = this.mockOrders.find(o => o.id === orderId) || null;
    return of(order).pipe(delay(300));
  }

  /**
   * Cria novo pedido
   */
  createOrder(orderData: CreateOrderData): Observable<UserOrder> {
    // Valida dados do pedido
    const validation = OrderHelper.validateOrderData(orderData);
    if (!validation.isValid) {
      throw new Error(`Dados do pedido inválidos: ${validation.errors.join(', ')}`);
    }

    const newOrder: UserOrder = {
      id: Date.now().toString(),
      orderNumber: OrderHelper.generateOrderNumber(),
      date: new Date(),
      status: 'pending',
      items: orderData.items,
      total: OrderHelper.calculateOrderTotal(orderData.items),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      estimatedDelivery: OrderHelper.getEstimatedDeliveryDate(new Date())
    };

    // Adiciona à lista de pedidos
    this.mockOrders.unshift(newOrder);
    this.saveOrdersToStorage();

    // Limpa carrinho após criar pedido
    this.cartService.clearCart();

    return of(newOrder).pipe(delay(800));
  }

  /**
   * Cancela pedido
   */
  cancelOrder(orderId: string): Observable<boolean> {
    const orderIndex = this.mockOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      this.notificationService.showError('Pedido não encontrado');
      return of(false);
    }

    if (!OrderHelper.isOrderCancellable(this.mockOrders[orderIndex].status)) {
      this.notificationService.showError('Este pedido não pode ser cancelado');
      return of(false);
    }

    // Atualiza status do pedido
    this.mockOrders[orderIndex] = {
      ...this.mockOrders[orderIndex],
      status: 'cancelled',
      paymentStatus: 'refunded'
    };

    this.saveOrdersToStorage();
    this.notificationService.showSuccess('Pedido cancelado com sucesso');

    return of(true).pipe(delay(500));
  }

  /**
   * Reordena pedido (adiciona itens ao carrinho)
   */
  reorder(orderId: string): Observable<boolean> {
    const order = this.mockOrders.find(o => o.id === orderId);

    if (!order) {
      this.notificationService.showError('Pedido não encontrado');
      return of(false);
    }

    // Obtém produtos para reordenação
    const productsForReorder = this.getProductsForReorder(orderId);

    if (productsForReorder.length === 0) {
      this.notificationService.showError('Não foi possível reordenar os itens');
      return of(false);
    }

    // Adiciona ao carrinho
    this.cartService.addMultipleToCart(productsForReorder);
    this.notificationService.showSuccess('Itens adicionados ao carrinho!');

    return of(true).pipe(delay(1000));
  }

  // ========== 🔄 MÉTODOS DE REORDENAÇÃO ==========

  /**
   * Obtém itens do pedido para reordenação
   */
  getOrderItemsForReorder(orderId: string): OrderItem[] {
    const order = this.mockOrders.find(o => o.id === orderId);
    return order ? order.items : [];
  }

  /**
   * Obtém produtos para reordenação (formato para carrinho)
   */
  getProductsForReorder(orderId: string): {
    product: Product,
    quantity: number,
    selectedOptions?: { [key: string]: string }
  }[] {
    const order = this.mockOrders.find(o => o.id === orderId);

    if (!order) return [];

    return order.items.map(item => {
      // Cria produto a partir dos dados do pedido
      const product = this.createProductFromOrderItem(item, order.orderNumber);

      const selectedOptions: { [key: string]: string } = {};
      if (item.size) selectedOptions['Tamanho'] = item.size;
      if (item.color) selectedOptions['Cor'] = item.color;

      return {
        product,
        quantity: item.quantity,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
      };
    });
  }

  // ========== 📊 MÉTODOS DE CONSULTA ==========

  /**
   * Obtém resumo de pedidos por status
   */
  getOrdersSummary(): Observable<{
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    const summary = OrderHelper.getOrdersSummary(this.mockOrders);
    return of(summary);
  }

  /**
   * Obtém status atual do pedido
   */
  getOrderStatus(orderId: string): Observable<OrderStatus | null> {
    const order = this.mockOrders.find(o => o.id === orderId);
    return of(order?.status || null);
  }

  /**
   * Verifica se pedido pode ser cancelado
   */
  canCancelOrder(orderId: string): Observable<boolean> {
    const order = this.mockOrders.find(o => o.id === orderId);
    return of(order ? OrderHelper.isOrderCancellable(order.status) : false);
  }

  // ========== 🛠️ MÉTODOS PRIVADOS ==========

  /**
   * Cria produto a partir de item do pedido
   */
  private createProductFromOrderItem(item: OrderItem, orderNumber: string): Product {
    const productData = {
      id: item.productId,
      name: item.productName,
      description: `Produto do pedido ${orderNumber} - ${item.productName}`,
      price: item.price,
      imgUrl: item.productImage,
      images: [item.productImage],
      stockQuantity: Math.floor(Math.random() * 20) + 5, // Estoque aleatório para demonstração
      dtCreated: '2024-01-01T00:00:00.000Z',
      dtUpdated: new Date().toISOString(),
      category: {
        id: 'cat-1',
        name: 'Categoria Principal',
        description: 'Descrição da categoria'
      },
      inStock: true,
      options: this.generateProductOptions(item)
    };

    return productData as Product;
  }

  /**
   * Gera opções do produto baseadas no item do pedido
   */
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
        values: [item.color, 'Preto', 'Branco', 'Vermelho', 'Azul'],
        required: true
      });
    }

    return options;
  }

  /**
   * Cria pedidos mock iniciais
   */
  private createMockOrders(): UserOrder[] {
    const mockAddress: UserAddress = {
      id: 'addr1',
      title: 'Casa',
      zip_code: '01234-567',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      is_default: true,
      recipientName: 'João Silva',
      phone: '(11) 99999-9999'
    };

    return [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        date: new Date('2024-01-15'),
        status: 'delivered',
        total: 299.97,
        trackingCode: 'TRK123456789',
        estimatedDelivery: new Date('2024-01-20'),
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            productName: 'Anel de Prata Sterling',
            productImage: 'https://via.placeholder.com/80',
            quantity: 2,
            price: 49.99,
            size: '17',
            color: 'Prata'
          },
          {
            id: 'item2',
            productId: 'prod2',
            productName: 'Colar Coração',
            productImage: 'https://via.placeholder.com/80',
            quantity: 1,
            price: 199.99,
            color: 'Prata'
          }
        ],
        shippingAddress: mockAddress
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        date: new Date('2024-01-10'),
        status: 'shipped',
        total: 159.98,
        trackingCode: 'TRK987654321',
        estimatedDelivery: new Date('2024-01-18'),
        paymentMethod: 'pix',
        paymentStatus: 'paid',
        items: [
          {
            id: 'item3',
            productId: 'prod3',
            productName: 'Brinco de Argola',
            productImage: 'https://via.placeholder.com/80',
            quantity: 1,
            price: 159.98,
            size: 'Médio',
            color: 'Dourado'
          }
        ],
        shippingAddress: mockAddress
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        date: new Date('2024-01-05'),
        status: 'pending',
        total: 89.97,
        paymentMethod: 'credit_card',
        paymentStatus: 'pending',
        items: [
          {
            id: 'item4',
            productId: 'prod4',
            productName: 'Pulseira Prata',
            productImage: 'https://via.placeholder.com/80',
            quantity: 3,
            price: 29.99,
            size: 'Único',
            color: 'Prata'
          }
        ],
        shippingAddress: mockAddress
      }
    ];
  }

  // ========== 💾 GERENCIAMENTO DE STORAGE ==========

  /**
   * Carrega pedidos do localStorage
   */
  private loadOrdersFromStorage(): UserOrder[] | null {
    try {
      const stored = localStorage.getItem(this.ORDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((order: any) => ({
          ...order,
          date: new Date(order.date),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos do storage:', error);
    }
    return null;
  }

  /**
   * Salva pedidos no localStorage
   */
  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(this.mockOrders));
    } catch (error) {
      console.error('Erro ao salvar pedidos no storage:', error);
    }
  }

  // ========== 🧪 MÉTODOS PARA DESENVOLVIMENTO ==========

  /**
   * Adiciona pedido mock para testes
   */
  addMockOrder(): void {
    const newOrder: UserOrder = {
      id: Date.now().toString(),
      orderNumber: OrderHelper.generateOrderNumber(),
      date: new Date(),
      status: 'pending',
      total: 199.90,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      items: [
        {
          id: `item-${Date.now()}`,
          productId: 'mock-product',
          productName: 'Produto de Teste',
          productImage: 'https://via.placeholder.com/80',
          quantity: 1,
          price: 199.90,
          color: 'Prata'
        }
      ],
      shippingAddress: {
        id: 'addr1',
        title: 'Casa',
        zip_code: '01234-567',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        is_default: true,
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      }
    };

    this.mockOrders.unshift(newOrder);
    this.saveOrdersToStorage();
    this.notificationService.showSuccess('Pedido mock adicionado!');
  }

  /**
   * Limpa todos os pedidos (apenas desenvolvimento)
   */
  clearAllOrders(): void {
    this.mockOrders = this.createMockOrders();
    this.saveOrdersToStorage();
    this.notificationService.showInfo('Pedidos resetados para estado inicial');
  }
}