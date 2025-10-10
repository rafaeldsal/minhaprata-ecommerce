import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../products/components/product-card/product-card.component';
import { ProductDetailsComponent } from '../products/components/product-details/product-details.component';
import { ProductListComponent } from '../products/components/product-list/product-list.component';
import { ProductImageCarouselComponent } from '../products/components/product-image-carousel/product-image-carousel.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProductCardComponent,
    ProductDetailsComponent,
    ProductListComponent,
    ProductImageCarouselComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    ProductCardComponent,
    ProductListComponent
  ]
})
export class ProductsModule { }
