import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatTabComponent } from '../../components/tabs/chat-tab/chat-tab.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ChatTabComponent],
  template: `
    <div class="chat-page-container">
      <div class="chat-content">
        <div class="chat-wrapper">
          <app-chat-tab></app-chat-tab>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-page-container {
      min-height: calc(100vh - 130px);
      width: 100vw;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      margin-left: -20px;
    }

    .chat-content {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .chat-wrapper {
      height: calc(100vh - 250px);
      width: 100%;
      position: relative;
      overflow: hidden;
      background: white;
      transform: scale(1.2);
      transform-origin: 0 0;
    }
  `]
})
export class ChatPageComponent {} 