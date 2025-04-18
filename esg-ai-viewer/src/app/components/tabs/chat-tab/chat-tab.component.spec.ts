import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatTabComponent } from './chat-tab.component';

describe('ChatTabComponent', () => {
  let component: ChatTabComponent;
  let fixture: ComponentFixture<ChatTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
