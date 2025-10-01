import { Component, Input, OnInit } from '@angular/core';
import { ProductReview } from '../../models/product';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: string;

  reviews: ProductReview[] = [];
  loading: boolean = true;
  submitting: boolean = false;
  showReviewForm: boolean = false;

  reviewForm: FormGroup;
  rating: number = 0;
  hoverRating: number = 0;

  // Stats
  averageRating: number = 0;
  totalReviews: number = 0;
  ratingDistribution: { rating: number; count: number; percentage: number }[] = [];

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.createReviewForm();
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  private createReviewForm(): FormGroup {
    return this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(2)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      verifiedPurchase: [false]
    });
  }

  private loadReviews(): void {
    this.loading = true;

    this.productService.getProductReviews(this.productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.calculateReviewStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar avaliações:', error);
        this.loading = false;
        this.notificationService.showError('Erro ao carregar avaliações');
      }
    });
  }

  private calculateReviewStats(): void {
    this.totalReviews = this.reviews.length;

    if (this.totalReviews > 0) {
      this.averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.totalReviews;

      // Calculate distribution
      this.ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
        const count = this.reviews.filter(review => review.rating === rating).length;
        const percentage = (count / this.totalReviews) * 100;
        return { rating, count, percentage };
      });
    }
  }

  // Rating stars
  setRating(rating: number): void {
    this.rating = rating;
    this.reviewForm.patchValue({ rating });
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  clearHoverRating(): void {
    this.hoverRating = 0;
  }

  getStarClass(starNumber: number): string {
    if (this.hoverRating >= starNumber) {
      return 'hover';
    } else if (this.rating >= starNumber) {
      return 'active';
    }
    return '';
  }

  // Review form
  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (!this.showReviewForm) {
      this.resetForm();
    }
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;

    const reviewData = {
      ...this.reviewForm.value,
      rating: this.rating
    };

    this.productService.addProductReview(this.productId, reviewData).subscribe({
      next: (newReview) => {
        this.reviews.unshift(newReview);
        this.calculateReviewStats();
        this.resetForm();
        this.showReviewForm = false;
        this.submitting = false;

        this.notificationService.showSuccess('Avaliação enviada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao enviar avaliação:', error);
        this.submitting = false;
        this.notificationService.showError('Erro ao enviar avaliação');
      }
    });
  }

  private resetForm(): void {
    this.reviewForm.reset({
      userName: '',
      rating: 0,
      comment: '',
      verifiedPurchase: false
    });
    this.rating = 0;
    this.hoverRating = 0;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reviewForm.controls).forEach(key => {
      this.reviewForm.get(key)?.markAsTouched();
    });
  }

  // Filter reviews by rating
  filterByRating(rating: number): void {
    // Implementar filtro se necessário
  }

  // Helper methods
  hasReviews(): boolean {
    return this.reviews.length > 0;
  }

  getRatingPercentage(rating: number): number {
    const dist = this.ratingDistribution.find(d => d.rating === rating);
    return dist ? dist.percentage : 0;
  }

  getRatingCount(rating: number): number {
    const dist = this.ratingDistribution.find(d => d.rating === rating);
    return dist ? dist.count : 0;
  }

  getRatingText(rating: number): string {
    const ratings = {
      1: 'Péssimo',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente'
    };
    return ratings[rating as keyof typeof ratings] || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  roundRating(rating: number): number {
    return Math.round(rating);
  }
}
