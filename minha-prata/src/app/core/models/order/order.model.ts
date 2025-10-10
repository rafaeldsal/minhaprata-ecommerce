import { UserAddress } from '../shared/address.model';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  date: Date;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  shippingAddress: UserAddress;
  trackingCode?: string;
  estimatedDelivery?: Date;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface OrdersResponse {
  orders: UserOrder[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: UserAddress;
  paymentMethod: string;
  customerNotes?: string;
}

// 📋 MÉTODOS AUXILIARES
export class OrderHelper {
  static generateOrderNumber(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  static getOrderStatusText(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return statusMap[status];
  }

  static getOrderStatusColor(status: OrderStatus): string {
    const colorMap: Record<OrderStatus, string> = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colorMap[status];
  }

  static calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  static isOrderCancellable(status: OrderStatus): boolean {
    return ['pending', 'confirmed'].includes(status);
  }

  static isOrderEditable(status: OrderStatus): boolean {
    return status === 'pending';
  }

  static getEstimatedDeliveryDate(orderDate: Date): Date {
    const estimated = new Date(orderDate);
    estimated.setDate(estimated.getDate() + 7); // 7 dias úteis
    return estimated;
  }

  static filterOrdersByStatus(orders: UserOrder[], status: OrderStatus): UserOrder[] {
    return orders.filter(order => order.status === status);
  }

  static sortOrdersByDate(orders: UserOrder[], ascending: boolean = false): UserOrder[] {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  static getOrdersSummary(orders: UserOrder[]): {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  } {
    return {
      total: orders.length,
      pending: this.filterOrdersByStatus(orders, 'pending').length,
      confirmed: this.filterOrdersByStatus(orders, 'confirmed').length,
      shipped: this.filterOrdersByStatus(orders, 'shipped').length,
      delivered: this.filterOrdersByStatus(orders, 'delivered').length,
      cancelled: this.filterOrdersByStatus(orders, 'cancelled').length
    };
  }

  static validateOrderData(data: CreateOrderData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.items || data.items.length === 0) {
      errors.push('Carrinho vazio');
    }

    if (!data.shippingAddress) {
      errors.push('Endereço de entrega é obrigatório');
    }

    if (!data.paymentMethod) {
      errors.push('Método de pagamento é obrigatório');
    }

    // Validar cada item do pedido
    data.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade inválida`);
      }
      if (item.price <= 0) {
        errors.push(`Item ${index + 1}: Preço inválido`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatOrderDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}