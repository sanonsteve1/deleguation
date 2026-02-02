import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiStockComponent } from './kpi-stock.component';

describe('KpiStockComponent', () => {
  let component: KpiStockComponent;
  let fixture: ComponentFixture<KpiStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
