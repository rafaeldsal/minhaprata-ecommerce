import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryStateService } from '../../../shared/services/category-state.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private categoryStateService: CategoryStateService
  ) { }

  ngOnInit() {
    // Apenas defina a categoria quando a rota for acessada
    this.route.params.subscribe(params => {
      const categorySlug = params['categoryId'];
      if (categorySlug) {
        this.categoryStateService.setSelectedCategory(categorySlug);
      }
    });
  }
}