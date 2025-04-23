import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
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
export class SummaryTabComponent implements OnChanges, OnDestroy, OnInit {
  @Input() data: any = null;
  
  summaryContent: string = '';
  loading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Settings with defaults
  summaryLength: number = 1000;
  useRAG: boolean = true;
  refreshRAGData: boolean = false;

  constructor(private esgService: EsgService) {
    // Load saved settings
    this.loadSettings();
  }

  ngOnInit() {
    // Do not automatically load summary
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // Reset the component state when data changes
      this.resetComponent();
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

  onUseRagChange() {
    if (!this.useRAG) {
      this.refreshRAGData = false;
    }
    this.saveSettings();
  }

  loadSummary() {
    const currentData = this.esgService.getCurrentCompanyData();
    const rawData = this.esgService.getRawCompanyData();
    
    if (!currentData || !rawData) {
      this.error = 'No company data available. Please select a company first.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.summaryContent = '';

    const data = {
      ...rawData,
      useRAG: this.useRAG,
      length: this.summaryLength,
      company: currentData.name,
      companyIsin: currentData.id
    };

    this.esgService.getSummary(data, this.refreshRAGData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.summaryContent = response;
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
    this.loadSummary();
  }
}
