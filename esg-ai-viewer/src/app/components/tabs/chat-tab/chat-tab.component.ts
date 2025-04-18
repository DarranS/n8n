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
    // Sanitize the iframe URL
    this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://n8n.sheltononline.com/workflow/8Pkpdy3klGJe8CSm'
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // In a real implementation, we might update the chat URL with context about the selected company
  }
}
