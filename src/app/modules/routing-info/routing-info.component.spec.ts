import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingInfoComponent } from './routing-info.component';

describe('RoutingInfoComponent', () => {
  let component: RoutingInfoComponent;
  let fixture: ComponentFixture<RoutingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoutingInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
