import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsgService } from '../../../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MarkdownModule, MarkedOptions, MARKED_OPTIONS, MarkdownService, SECURITY_CONTEXT } from 'ngx-markdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

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
    MarkdownModule,
    MatIconModule
  ],
  providers: [
    MarkdownService,
    {
      provide: SECURITY_CONTEXT,
      useValue: 0
    },
    {
      provide: MARKED_OPTIONS,
      useValue: {
        gfm: true,
        breaks: true,
        pedantic: false,
        smartLists: true,
        smartypants: true
      } as MarkedOptions,
    }
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
    if (!this.data) {
      this.error = 'No company data available. Please select a company first.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.summaryContent = '';

    // Get the current company data from the service
    const currentCompany = this.esgService.getCurrentCompanyData();
    
    const data = {
      ...this.data,
      useRAG: this.useRAG,
      length: this.summaryLength,
      id: currentCompany?.id // Add the company ID
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

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.summaryContent)
      .then(() => {
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  }
}
