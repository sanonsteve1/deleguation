import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiFinanceComponent } from './kpi-finance.component';

describe('KpiFinanceComponent', () => {
  let component: KpiFinanceComponent;
  let fixture: ComponentFixture<KpiFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiFinanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
