import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCommercialComponent } from './kpi-commercial.component';

describe('KpiCommercialComponent', () => {
  let component: KpiCommercialComponent;
  let fixture: ComponentFixture<KpiCommercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCommercialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiCommercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
