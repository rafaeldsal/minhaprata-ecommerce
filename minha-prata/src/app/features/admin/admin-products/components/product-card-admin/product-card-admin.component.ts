import { Component, Input } from '@angular/core';
import { Product } from '../../../../../core/models';

@Component({
  selector: 'app-product-card-admin',
  templateUrl: './product-card-admin.component.html',
  styleUrls: ['./product-card-admin.component.scss']
})
export class ProductCardAdminComponent {
  @Input() product!: Product;
  @Input() selected = false;
}