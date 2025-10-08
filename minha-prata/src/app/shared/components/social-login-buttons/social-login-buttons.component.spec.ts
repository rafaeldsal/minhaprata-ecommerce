import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialLoginButtonsComponent } from './social-login-buttons.component';

describe('SocialLoginButtonsComponent', () => {
  let component: SocialLoginButtonsComponent;
  let fixture: ComponentFixture<SocialLoginButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SocialLoginButtonsComponent]
    });
    fixture = TestBed.createComponent(SocialLoginButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
