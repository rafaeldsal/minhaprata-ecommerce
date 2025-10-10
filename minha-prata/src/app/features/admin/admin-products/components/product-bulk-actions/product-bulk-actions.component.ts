import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { BulkAction } from 'src/app/core/models';

@Component({
  selector: 'app-product-bulk-actions',
  templateUrl: './product-bulk-actions.component.html',
  styleUrls: ['./product-bulk-actions.component.scss']
})
export class ProductBulkActionsComponent {
  @Input() set selectedCount(value: number) {
    this.selectedCountValue.set(value);
  }

  @Input() set isLoading(value: boolean) {
    this.isLoadingValue.set(value);
  }

  @Output() action = new EventEmitter<BulkAction['type']>();
  @Output() clear = new EventEmitter<void>();

  readonly selectedCountValue = signal(0);
  readonly isLoadingValue = signal(false);
  readonly isDropdownOpen = signal(false);

  readonly actions = [
    { type: 'activate' as const, label: 'Ativar Produtos', icon: '✅', description: 'Tornar produtos visíveis' },
    { type: 'deactivate' as const, label: 'Desativar Produtos', icon: '⏸️', description: 'Ocultar produtos' },
    { type: 'delete' as const, label: 'Excluir Produtos', icon: '🗑️', description: 'Remover permanentemente', danger: true }
  ];

  executeAction(actionType: BulkAction['type']): void {
    this.action.emit(actionType);
    this.isDropdownOpen.set(false);
  }

  clearSelection(): void {
    this.clear.emit();
    this.isDropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }
}
