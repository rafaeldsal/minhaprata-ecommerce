import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBulkActionsComponent } from './category-bulk-actions.component';

describe('CategoryBulkActionsComponent', () => {
  let component: CategoryBulkActionsComponent;
  let fixture: ComponentFixture<CategoryBulkActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryBulkActionsComponent]
    });
    fixture = TestBed.createComponent(CategoryBulkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
