import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDangerZoneComponent } from './settings-danger-zone.component';

describe('SettingsDangerZoneComponent', () => {
  let component: SettingsDangerZoneComponent;
  let fixture: ComponentFixture<SettingsDangerZoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsDangerZoneComponent]
    });
    fixture = TestBed.createComponent(SettingsDangerZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
