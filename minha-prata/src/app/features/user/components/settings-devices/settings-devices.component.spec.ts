import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDevicesComponent } from './settings-devices.component';

describe('SettingsDevicesComponent', () => {
  let component: SettingsDevicesComponent;
  let fixture: ComponentFixture<SettingsDevicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsDevicesComponent]
    });
    fixture = TestBed.createComponent(SettingsDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
