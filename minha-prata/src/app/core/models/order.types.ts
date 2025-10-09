// src/types/order.types.ts
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

export interface UserAddress {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  recipientName: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

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
}

export interface OrdersResponse {
  orders: UserOrder[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}