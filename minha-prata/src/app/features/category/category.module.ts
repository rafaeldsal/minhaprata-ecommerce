import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CategoryComponent } from './components/category/category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProductsModule } from '../products/products.module';

const routes: Routes = [
  { path: '', component: CategoryComponent }
];

@NgModule({
  declarations: [CategoryComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProductsModule,
    RouterModule.forChild(routes)
  ]
})
export class CategoryModule { }
