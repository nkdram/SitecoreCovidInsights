import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordsChartComponent } from './keywords-chart.component';

describe('KeywordsChartComponent', () => {
  let component: KeywordsChartComponent;
  let fixture: ComponentFixture<KeywordsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeywordsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeywordsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
