import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardAdminComponent } from './product-card-admin.component';

describe('ProductCardAdminComponent', () => {
  let component: ProductCardAdminComponent;
  let fixture: ComponentFixture<ProductCardAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductCardAdminComponent]
    });
    fixture = TestBed.createComponent(ProductCardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
