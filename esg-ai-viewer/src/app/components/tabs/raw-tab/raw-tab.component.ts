import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-raw-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="raw-tab-container">
      <div class="toolbar">
        <button mat-icon-button (click)="copyToClipboard()" title="Copy to clipboard">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
      <pre class="json-content">{{formattedData}}</pre>
    </div>
  `,
  styles: [`
    .raw-tab-container {
      padding: 1rem;
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .json-content {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow: auto;
      font-family: monospace;
      white-space: pre-wrap;
    }
  `]
})
export class RawTabComponent {
  @Input() data: any = null;

  get formattedData(): string {
    return this.data ? JSON.stringify(this.data, null, 2) : '';
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.formattedData)
      .then(() => {
        // You could add a toast notification here if you want
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  }
}
