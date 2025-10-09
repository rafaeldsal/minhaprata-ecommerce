import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order/order.service';
import { UserOrder, OrderStatus, OrdersResponse } from '../../../../core/models/order.types';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.scss']
})
export class UserOrdersComponent implements OnInit {
  orders: UserOrder[] = [];
  loading = false;
  error = '';

  // Paginação ajustada para seu componente
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 1;

  // Filtros
  statusFilter: OrderStatus | 'all' = 'all';
  readonly statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos os Pedidos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregues' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    // Passe o statusFilter diretamente (já inclui 'all')
    this.orderService.getOrders(this.currentPage, this.itemsPerPage, this.statusFilter)
      .subscribe({
        next: (response) => {
          this.orders = response.orders;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(response.total / this.itemsPerPage);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar pedidos. Tente novamente.';
          this.loading = false;
          console.error('Error loading orders:', error);
        }
      });
  }

  onStatusFilterChange(event: any): void {
    // O valor já está bindado via ngModel, só resetar a página e carregar
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onReorder(orderId: string): void {
    this.orderService.reorder(orderId).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.showSuccess('Produtos adicionados ao carrinho com sucesso!');
        }
      },
      error: (error) => {
        this.notificationService.showError('Erro ao refazer pedido. Tente novamente.');
        console.error('Error reordering:', error);
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
}