import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chat-container">
      <h1>ESG AI Chat</h1>
      <div class="content">
        <div class="chat-interface">
          <div class="chat-frame">
            <iframe [src]="chatUrl" class="chat-iframe" title="ESG Chatbot"></iframe>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      height: calc(100vh - 120px);

      h1 {
        color: #1976d2;
        margin-bottom: 2rem;
        text-align: center;
      }

      .content {
        height: calc(100% - 80px);
        
        .chat-interface {
          height: 100%;
          width: 100%;
          position: relative;
          background: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;

          .chat-description {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;

            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 1rem;
            }

            ul {
              list-style-type: none;
              padding: 0;
              margin: 0;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;

              li {
                color: #666;
                padding-left: 1.5rem;
                position: relative;
                text-align: left;

                &:before {
                  content: "•";
                  color: #1976d2;
                  position: absolute;
                  left: 0;
                }
              }
            }
          }

          .chat-frame {
            flex: 1;
            position: relative;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

            .chat-iframe {
              border: none;
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .chat-container {
        padding: 1rem;
        height: calc(100vh - 80px);
      }

      .chat-interface {
        padding: 1rem !important;

        .chat-description {
          ul {
            grid-template-columns: 1fr !important;
          }
        }
      }
    }
  `]
})
export class ChatPageComponent implements OnInit {
  chatUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const chatEndpoint = 'https://n8n.sheltononline.com/webhook/047eecfa-1a30-4d08-a9fa-ab0271c4409a/chat';
    this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(chatEndpoint);
  }

  ngOnInit() {
    // No need to subscribe to company changes anymore
  }
} 