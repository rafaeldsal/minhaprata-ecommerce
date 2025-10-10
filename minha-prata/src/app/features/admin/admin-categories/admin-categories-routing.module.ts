import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryListComponent } from './components/category-list/category-list.component';

const routes: Routes = [
  { path: '', component: CategoryListComponent, data: { title: 'Gerenciar Categorias' } },
  { path: 'new', component: CategoryListComponent, data: { title: 'Nova Categoria' } },
  { path: 'edit/:id', component: CategoryListComponent, data: { title: 'Editar Categoria' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminCategoriesRoutingModule { }
