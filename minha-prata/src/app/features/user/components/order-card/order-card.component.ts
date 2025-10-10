// src/app/user/components/order-card/order-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserOrder } from '../../../../core/models/order/order.model';
import { OrderDataService } from '../../../../core/services/data/order-data.service';
import { CartService } from '../../../../core/services/business/cart.service';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent {
  @Input() order!: UserOrder;
  @Output() reorder = new EventEmitter<string>();

  reordering = false;
  reorderSuccess = false;

  constructor(
    private orderDataService: OrderDataService,
    private cartService: CartService
  ) { }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'status-badge--warning',
      confirmed: 'status-badge--info',
      shipped: 'status-badge--primary',
      delivered: 'status-badge--success',
      cancelled: 'status-badge--error'
    };
    return classes[status] || 'status-badge--default';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  }

  onReorder(): void {
    if (!this.order) return;

    this.reordering = true;
    this.reorderSuccess = false;

    // Obtém os produtos formatados para o carrinho
    const cartItems = this.orderDataService.getProductsForReorder(this.order.id);

    if (cartItems.length === 0) {
      console.error('Não foi possível encontrar os itens do pedido');
      this.reordering = false;
      return;
    }

    // Usa o método addMultipleToCart do CartService
    this.cartService.addMultipleToCart(cartItems);

    // Simula o processo
    setTimeout(() => {
      this.reordering = false;
      this.reorderSuccess = true;

      // Emite evento para o componente pai (opcional)
      this.reorder.emit(this.order.id);

      // Auto-esconde a mensagem de sucesso
      setTimeout(() => {
        this.reorderSuccess = false;
      }, 3000);

      console.log('Itens adicionados ao carrinho do order-card:', cartItems);
    }, 1000);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}