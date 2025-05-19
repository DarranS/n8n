import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionTabComponent } from './question-tab.component';

describe('QuestionTabComponent', () => {
  let component: QuestionTabComponent;
  let fixture: ComponentFixture<QuestionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 