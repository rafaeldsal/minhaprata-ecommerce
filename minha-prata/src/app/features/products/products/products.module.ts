import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { ProductGridComponent } from '../components/product-grid/product-grid.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ProductCardComponent,
    ProductGridComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ProductCardComponent,
    ProductGridComponent
  ]
})
export class ProductsModule { }
