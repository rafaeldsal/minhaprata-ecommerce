import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGridComponent } from '../components/product-grid/product-grid.component';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { ProductDetailsComponent } from '../components/product-details/product-details.component';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    ProductGridComponent,
    ProductCardComponent,
    ProductDetailsComponent,
    ProductListComponent
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
