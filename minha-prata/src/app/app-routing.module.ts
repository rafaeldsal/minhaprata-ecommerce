import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestProductComponent } from './features/products/components/test-product/test-product.component';
import { HomeComponent } from './features/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'test-product', component: TestProductComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
