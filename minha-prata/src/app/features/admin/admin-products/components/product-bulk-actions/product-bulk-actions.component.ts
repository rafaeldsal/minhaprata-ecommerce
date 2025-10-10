import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-bulk-actions',
  templateUrl: './product-bulk-actions.component.html',
  styleUrls: ['./product-bulk-actions.component.scss']
})
export class ProductBulkActionsComponent {
  @Input() selectedCount = 0;
  @Input() isLoading = false;
  @Output() action = new EventEmitter<'activate' | 'deactivate' | 'delete'>();
}
