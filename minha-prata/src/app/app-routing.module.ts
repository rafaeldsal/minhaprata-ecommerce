import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestProductComponent } from './features/products/components/test-product/test-product.component';
import { HomeComponent } from './features/home/home.component';
import { CategoryComponent } from './features/category/category/category.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { ProductDetailsComponent } from './features/products/components/product-details/product-details.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categoria/:categoryId', component: CategoryComponent },
  { path: 'produto/:id', component: ProductDetailsComponent },


  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
