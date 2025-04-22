import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-tab.component.html',
  styleUrl: './chat-tab.component.scss'
})
export class ChatTabComponent implements OnChanges {
  @Input() data: any = null;
  
  chatUrl: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) {
    // Use the webhook chat URL
    const chatEndpoint = 'https://n8n.sheltononline.com/webhook/047eecfa-1a30-4d08-a9fa-ab0271c4409a/chat';
    this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(chatEndpoint);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Update chat URL with company context if needed
      const chatEndpoint = `https://n8n.sheltononline.com/webhook/047eecfa-1a30-4d08-a9fa-ab0271c4409a/chat?company=${encodeURIComponent(this.data.name)}`;
      this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(chatEndpoint);
    }
  }
}
