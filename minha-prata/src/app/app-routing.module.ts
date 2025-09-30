import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestProductComponent } from './features/products/components/test-product/test-product.component';

const routes: Routes = [
  { path: 'test-product', component: TestProductComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
