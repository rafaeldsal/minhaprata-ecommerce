import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBulkActionsComponent } from './product-bulk-actions.component';

describe('ProductBulkActionsComponent', () => {
  let component: ProductBulkActionsComponent;
  let fixture: ComponentFixture<ProductBulkActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductBulkActionsComponent]
    });
    fixture = TestBed.createComponent(ProductBulkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
