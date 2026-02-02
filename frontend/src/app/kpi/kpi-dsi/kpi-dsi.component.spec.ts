import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiDsiComponent } from './kpi-dsi.component';

describe('KpiDsiComponent', () => {
  let component: KpiDsiComponent;
  let fixture: ComponentFixture<KpiDsiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiDsiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiDsiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
