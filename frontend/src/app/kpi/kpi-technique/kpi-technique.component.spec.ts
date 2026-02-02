import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiTechniqueComponent } from './kpi-technique.component';

describe('KpiTechniqueComponent', () => {
  let component: KpiTechniqueComponent;
  let fixture: ComponentFixture<KpiTechniqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiTechniqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiTechniqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
