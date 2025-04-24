import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-lg p-4">
        <div class="mb-4">
          <h1 class="text-2xl font-bold mb-4">ESG AI Chat</h1>
          <div class="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            <!-- Chat messages will go here -->
          </div>
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="message"
              placeholder="Type your message..."
              class="flex-1 p-2 border rounded-lg"
            />
            <button
              (click)="sendMessage()"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChatComponent {
  message: string = '';

  sendMessage() {
    if (this.message.trim()) {
      // TODO: Implement message sending logic
      console.log('Sending message:', this.message);
      this.message = '';
    }
  }
} 