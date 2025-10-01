import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailsComponent } from '../../components/product-details/product-details.component';
import { ProductImageCarouselComponent } from '../../components/product-image-carousel/product-image-carousel.component';
import { ProductReviewsComponent } from '../../components/product-reviews/product-reviews.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: 'produto/:id', component: ProductDetailsComponent }
]

@NgModule({
  declarations: [
    ProductDetailsComponent,
    ProductImageCarouselComponent,
    ProductReviewsComponent,
    RelatedProductsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ]
})
export class ProductDetailsModule { }
