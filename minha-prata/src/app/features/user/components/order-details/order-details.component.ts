// src/app/features/user/components/order-details/order-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/order/order.service';
import { UserOrder, OrderStatus } from '../../../../core/models/order.types';
import { CartService } from 'src/app/features/cart/services/cart.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  order: UserOrder | null = null;
  loading = false;
  error = '';
  reordering = false;
  reorderSuccess = false;

  // Status steps para a barra de progresso
  readonly statusSteps = [
    { status: 'pending', label: 'Pedido Recebido', description: 'Seu pedido foi recebido e está sendo processado' },
    { status: 'confirmed', label: 'Confirmado', description: 'Pagamento confirmado e pedido em preparação' },
    { status: 'shipped', label: 'Enviado', description: 'Seu pedido saiu para entrega' },
    { status: 'delivered', label: 'Entregue', description: 'Pedido entregue com sucesso' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.error = '';
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.error = 'Pedido não encontrado';
      this.loading = false;
      return;
    }

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        if (!order) {
          this.error = 'Pedido não encontrado';
        }
      },
      error: (error) => {
        this.error = 'Erro ao carregar detalhes do pedido';
        this.loading = false;
        console.error('Error loading order details:', error);
      }
    });
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const classes = {
      pending: 'status-badge--warning',
      confirmed: 'status-badge--info',
      shipped: 'status-badge--primary',
      delivered: 'status-badge--success',
      cancelled: 'status-badge--error'
    };
    return classes[status];
  }

  getStatusText(status: OrderStatus): string {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getCurrentStepIndex(): number {
    if (!this.order) return -1;

    const statusIndex = this.statusSteps.findIndex(step => step.status === this.order!.status);
    return statusIndex !== -1 ? statusIndex : 0;
  }

  isStepCompleted(stepIndex: number): boolean {
    const currentStepIndex = this.getCurrentStepIndex();
    return stepIndex <= currentStepIndex;
  }

  isStepActive(stepIndex: number): boolean {
    return stepIndex === this.getCurrentStepIndex();
  }

  onReorder(): void {
    if (!this.order) return;

    this.reordering = true;
    this.reorderSuccess = false;

    // Obtém os produtos formatados para o carrinho
    const cartItems = this.orderService.getProductsForReorder(this.order.id);

    if (cartItems.length === 0) {
      this.error = 'Não foi possível encontrar os itens do pedido';
      this.reordering = false;
      return;
    }

    // Usa o novo método addMultipleToCart
    this.cartService.addMultipleToCart(cartItems);

    // Simula o processo (em produção, isso seria uma chamada API)
    setTimeout(() => {
      this.reordering = false;
      this.reorderSuccess = true;

      // Opcional: Auto-esconde a mensagem de sucesso após alguns segundos
      setTimeout(() => {
        this.reorderSuccess = false;
      }, 5000);

      console.log('Itens adicionados ao carrinho:', cartItems);
    }, 1000);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/user/orders']);
  }

  getSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    // Simulação - você pode ajustar conforme sua lógica
    return 15.90;
  }

  hasShippingCost(): boolean {
    return this.order?.status !== 'cancelled';
  }
}