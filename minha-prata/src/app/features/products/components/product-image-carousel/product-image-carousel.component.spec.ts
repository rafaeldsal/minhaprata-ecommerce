import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageCarouselComponent } from './product-image-carousel.component';

describe('ProductImageCarouselComponent', () => {
  let component: ProductImageCarouselComponent;
  let fixture: ComponentFixture<ProductImageCarouselComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductImageCarouselComponent]
    });
    fixture = TestBed.createComponent(ProductImageCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
