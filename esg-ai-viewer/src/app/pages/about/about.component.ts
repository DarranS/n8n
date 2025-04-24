import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule, MarkdownService, SECURITY_CONTEXT } from 'ngx-markdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  template: `
    <div class="about-container">
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading documentation...</p>
      </div>

      <div *ngIf="error" class="error-container">
        <p class="error-message">{{ error }}</p>
      </div>

      <div class="markdown-content" markdown [data]="readmeContent" *ngIf="!isLoading && !error"></div>
    </div>
  `,
  styles: [`
    .about-container {
      height: calc(100vh - 64px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
      padding: 2rem;

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 1rem;

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        p {
          color: #666;
          font-size: 1.1rem;
        }
      }

      .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;

        .error-message {
          color: #d32f2f;
          font-size: 1.1rem;
          text-align: center;
          max-width: 600px;
        }
      }

      .markdown-content {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        h1, h2, h3, h4, h5, h6 {
          color: #1976d2;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 2rem;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 0.5rem;
        }

        h2 {
          font-size: 1.75rem;
        }

        h3 {
          font-size: 1.5rem;
        }

        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          color: #333;
        }

        ul, ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;

          li {
            margin-bottom: 0.5rem;
            color: #333;
          }
        }

        code {
          background-color: #f5f5f5;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Courier New', Courier, monospace;
        }

        pre {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin-bottom: 1rem;

          code {
            background-color: transparent;
            padding: 0;
          }
        }

        blockquote {
          border-left: 4px solid #1976d2;
          padding-left: 1rem;
          margin-left: 0;
          color: #666;
          font-style: italic;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;

          th, td {
            border: 1px solid #ddd;
            padding: 0.5rem;
            text-align: left;
          }

          th {
            background-color: #f5f5f5;
          }
        }

        a {
          color: #1976d2;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  standalone: true,
  imports: [MarkdownModule, CommonModule],
  providers: [
    MarkdownService,
    { provide: SECURITY_CONTEXT, useValue: 0 }
  ]
})
export class AboutComponent implements OnInit {
  readmeContent: string = '';
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private http: HttpClient,
    private markdownService: MarkdownService
  ) {}

  ngOnInit() {
    this.loadReadme();
  }

  private loadReadme() {
    this.isLoading = true;
    this.error = '';
    
    this.http.get('assets/README.md', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.readmeContent = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading README:', err);
          this.error = 'Failed to load documentation. Please try again later.';
          this.isLoading = false;
          this.readmeContent = `
# Error Loading Documentation

We apologize for the inconvenience. The documentation could not be loaded at this time.

Please check the repository for the latest documentation or try again later.

Error details: ${err.message}
          `;
        }
      });
  }
} 