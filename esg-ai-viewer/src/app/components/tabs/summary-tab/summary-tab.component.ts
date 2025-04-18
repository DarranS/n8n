import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsgService } from '../../../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-summary-tab',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './summary-tab.component.html',
  styleUrl: './summary-tab.component.scss'
})
export class SummaryTabComponent implements OnChanges {
  @Input() data: any = null;
  
  summaryContent: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private esgService: EsgService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.loadSummary();
    }
  }

  private loadSummary(): void {
    if (!this.data) {
      this.error = 'Missing company data. Cannot load summary.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.summaryContent = '';

    this.esgService.getSummary(this.data).subscribe({
      next: (summary) => {
        this.summaryContent = summary;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load summary. Please try again.';
        this.loading = false;
        console.error('Summary loading error:', err);
      }
    });
  }

  refreshSummary(): void {
    if (this.data) {
      this.loadSummary();
    }
  }
}
