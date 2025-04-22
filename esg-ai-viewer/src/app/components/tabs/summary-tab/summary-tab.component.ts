import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsgService } from '../../../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-summary-tab',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MarkdownModule],
  templateUrl: './summary-tab.component.html',
  styleUrl: './summary-tab.component.scss'
})
export class SummaryTabComponent implements OnChanges, OnDestroy {
  @Input() data: any = null;
  
  summaryContent: string = '';
  loading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private esgService: EsgService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // Reset the component state when data changes
      this.resetComponent();
      
      if (this.data) {
        this.loadSummary();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetComponent(): void {
    this.summaryContent = '';
    this.loading = false;
    this.error = null;
  }

  private loadSummary(): void {
    if (!this.data) {
      this.error = 'Missing company data. Cannot load summary.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.summaryContent = '';

    this.esgService.getSummary(this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
