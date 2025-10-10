import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProductHelper, Product } from '../../../../core/models/product/product.model';

@Component({
  selector: 'app-product-image-carousel',
  templateUrl: './product-image-carousel.component.html',
  styleUrls: ['./product-image-carousel.component.scss']
})
export class ProductImageCarouselComponent implements OnChanges {
  @Input() product!: Product;

  images: string[] = [];
  currentImageIndex: number = 0;
  isZoomed: boolean = false;

  // Tecla ESC para fechar zoom
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isZoomed) {
      this.closeZoom();
      event.preventDefault();
    }
  }

  // Clique fora para fechar zoom
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (this.isZoomed) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('zoom-overlay')) {
        this.closeZoom();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.images = ProductHelper.getProductImages(this.product);
      this.currentImageIndex = 0;
    }
  }

  nextImage(event?: Event): void {
    if (event) event.stopPropagation();
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  previousImage(event?: Event): void {
    if (event) event.stopPropagation();
    this.currentImageIndex = this.currentImageIndex === 0
      ? this.images.length - 1
      : this.currentImageIndex - 1;
  }

  goToImage(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.currentImageIndex = index;
  }

  openZoom(event?: Event): void {
    if (event) event.stopPropagation();
    this.isZoomed = true;
    document.body.style.overflow = 'hidden';
  }

  closeZoom(event?: Event): void {
    if (event) event.stopPropagation();
    this.isZoomed = false;
    document.body.style.overflow = '';
  }

  get currentImage(): string {
    return this.images[this.currentImageIndex] || '';
  }

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }
}