import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDragDropComponent } from './category-drag-drop.component';

describe('CategoryDragDropComponent', () => {
  let component: CategoryDragDropComponent;
  let fixture: ComponentFixture<CategoryDragDropComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryDragDropComponent]
    });
    fixture = TestBed.createComponent(CategoryDragDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
