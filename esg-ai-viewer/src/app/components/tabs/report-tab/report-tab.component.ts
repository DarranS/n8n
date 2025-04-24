import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsgService } from '../../../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-tab',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MarkdownModule, MatIconModule],
  templateUrl: './report-tab.component.html',
  styleUrl: './report-tab.component.scss'
})
export class ReportTabComponent implements OnChanges {
  @Input() data: any = null;
  
  reportContent: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private esgService: EsgService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.loadReport();
    }
  }

  private loadReport(): void {
    if (!this.data) {
      this.error = 'Missing company data. Cannot load report.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.reportContent = '';

    this.esgService.getReport(this.data).subscribe({
      next: (report) => {
        console.log('Received report:', report);
        this.reportContent = report || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load report. Please try again.';
        this.loading = false;
        console.error('Report loading error:', err);
      }
    });
  }

  refreshReport(): void {
    if (this.data) {
      this.loadReport();
    }
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.reportContent)
      .then(() => {
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  }
}
