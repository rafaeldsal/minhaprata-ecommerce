import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../products/services/category.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categoryId: string = '';
  categoryName: string = '';

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['categoryId'];
      this.loadCategoryName();
    });
  }

  loadCategoryName(): void {
    this.categoryService.getCategoryBySlug(this.categoryId).subscribe({
      next: (category) => {
        this.categoryName = category?.name || 'Categoria';
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        this.categoryName = 'Categoria';
      }
    });
  }
}