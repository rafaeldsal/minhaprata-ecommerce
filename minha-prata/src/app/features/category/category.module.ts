import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProductsModule } from '../products/products/products.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'categoria/:categoryId', component: CategoryComponent }
]

@NgModule({
  declarations: [
    CategoryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProductsModule,
    RouterModule.forChild(routes)
  ]
})
export class CategoryModule { }
