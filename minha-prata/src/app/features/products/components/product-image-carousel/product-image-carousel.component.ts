import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ProductImage } from '../../models/product';

@Component({
  selector: 'app-product-image-carousel',
  templateUrl: './product-image-carousel.component.html',
  styleUrls: ['./product-image-carousel.component.scss']
})
export class ProductImageCarouselComponent implements AfterViewInit {
  @Input() images: ProductImage[] = [];
  @Input() productName: string = '';

  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('mainImage') mainImage!: ElementRef<HTMLImageElement>;

  currentIndex = 0;
  isModalOpen = false;
  modalImageIndex = 0;
  startX = 0;
  currentX = 0;
  isDragging = false;

  constructor(
    private elementRef: ElementRef
  ) { }

  ngAfterViewInit(): void {
    this.updateCarouselPosition();
  }

  goToSlide(index: number): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateCarouselPosition();
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateCarouselPosition();
  }

  private updateCarouselPosition(): void {
    if (this.carouselTrack) {
      const track = this.carouselTrack.nativeElement;
      track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
  }

  // Thumbnail clicks
  selectThumbnail(index: number): void {
    this.goToSlide(index);
  }

  // Modal functions
  openModal(index: number): void {
    this.modalImageIndex = index;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    document.body.style.overflow = '';
  }

  nextModalImage(): void {
    this.modalImageIndex = (this.modalImageIndex + 1) % this.images.length;
  }

  prevModalImage(): void {
    this.modalImageIndex = (this.modalImageIndex - 1 + this.images.length) % this.images.length;
  }

  // Touch events para mobile
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    this.currentX = event.touches[0].clientX;
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    if (!this.isDragging) return;

    const diff = this.startX - this.currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }

    this.isDragging = false;
  }

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isModalOpen) return;

    switch (event.key) {
      case 'ArrowLeft':
        this.prevModalImage();
        break;
      case 'ArrowRight':
        this.nextModalImage();
        break;
      case 'Escape':
        this.closeModal();
        break;
    }
  }

  // Zoom function
  zoomImage(event: MouseEvent): void {
    const img = this.mainImage.nativeElement;
    const rect = img.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.classList.toggle('zoomed');
  }

  resetZoom(): void {
    this.mainImage.nativeElement.classList.remove('zoomed');
  }
}
