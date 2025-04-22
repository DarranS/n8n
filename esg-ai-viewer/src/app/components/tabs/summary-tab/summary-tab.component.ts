import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsgService } from '../../../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-summary-tab',
  standalone: true,
  imports: [
    CommonModule, 
    MatProgressSpinnerModule, 
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    FormsModule,
    MarkdownModule
  ],
  templateUrl: './summary-tab.component.html',
  styleUrl: './summary-tab.component.scss'
})
export class SummaryTabComponent implements OnChanges, OnDestroy {
  @Input() data: any = null;
  
  summaryContent: string = '';
  loading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Settings with defaults
  summaryLength: number = 500;
  useRAG: boolean = true;

  constructor(private esgService: EsgService) {
    // Load saved settings
    this.loadSettings();
  }

  private loadSettings(): void {
    const savedLength = localStorage.getItem('summaryLength');
    const savedUseRAG = localStorage.getItem('useRAG');
    
    if (savedLength) {
      this.summaryLength = parseInt(savedLength, 10);
    }
    if (savedUseRAG !== null) {
      this.useRAG = savedUseRAG === 'true';
    }
  }

  private saveSettings(): void {
    localStorage.setItem('summaryLength', this.summaryLength.toString());
    localStorage.setItem('useRAG', this.useRAG.toString());
  }

  onSettingsChange(): void {
    this.saveSettings();
    if (this.data) {
      this.loadSummary();
    }
  }

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

    // Add settings to the request
    const requestData = {
      ...this.data,
      length: this.summaryLength,
      useRAG: this.useRAG
    };

    this.esgService.getSummary(requestData)
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
