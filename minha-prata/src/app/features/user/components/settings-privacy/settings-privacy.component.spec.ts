import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPrivacyComponent } from './settings-privacy.component';

describe('SettingsPrivacyComponent', () => {
  let component: SettingsPrivacyComponent;
  let fixture: ComponentFixture<SettingsPrivacyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPrivacyComponent]
    });
    fixture = TestBed.createComponent(SettingsPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
