import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawTabComponent } from './raw-tab.component';

describe('RawTabComponent', () => {
  let component: RawTabComponent;
  let fixture: ComponentFixture<RawTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RawTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
