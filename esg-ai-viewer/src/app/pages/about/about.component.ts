import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule, MarkdownService, SECURITY_CONTEXT } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { BuildInfoService } from '../../services/build-info.service';

@Component({
  selector: 'app-about',
  template: `
    <div class="about-container">
      <div class="build-info">
        <h3>Build Information</h3>
        <div class="info-row">
          <span class="label">Build Tag:</span>
          <span class="value">{{ buildTag }}</span>
        </div>
        <div class="info-row">
          <span class="label">Environment:</span>
          <span class="value">{{ environment }}</span>
        </div>
      </div>

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
    }

    .build-info {
      background-color: white;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.2rem;
      }

      .info-row {
        display: flex;
        margin-bottom: 0.5rem;
        font-family: monospace;
        font-size: 1rem;

        .label {
          width: 120px;
          color: #666;
          font-weight: bold;
        }

        .value {
          color: #333;
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #1976d2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      p {
        margin-top: 1rem;
        color: #666;
      }
    }

    .error-container {
      padding: 2rem;
      background-color: #fff3f3;
      border-radius: 8px;

      .error-message {
        color: #d32f2f;
        margin: 0;
      }
    }

    .markdown-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  buildTag: string = 'Not available';
  environment: string = 'Development';

  constructor(
    private http: HttpClient,
    private markdownService: MarkdownService,
    private buildInfoService: BuildInfoService
  ) {
    console.log('About component constructor');
  }

  ngOnInit() {
    console.log('About component initializing...');
    this.buildTag = this.buildInfoService.getBuildTag();
    this.environment = this.buildInfoService.getEnvironment();
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
        }
      });
  }
} 