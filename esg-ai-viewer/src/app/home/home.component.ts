import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RawTabComponent } from '../components/tabs/raw-tab/raw-tab.component';
import { ReportTabComponent } from '../components/tabs/report-tab/report-tab.component';
import { SummaryTabComponent } from '../components/tabs/summary-tab/summary-tab.component';
import { ChatTabComponent } from '../components/tabs/chat-tab/chat-tab.component';
import { Company, CompanyService } from '../services/company.service';
import { EsgService } from '../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RawTabComponent,
    ReportTabComponent,
    SummaryTabComponent,
    ChatTabComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedCompany: Company | null = null;
  esgData: any = null;
  loading: boolean = false;
  error: string | null = null;
  errorDetails: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private companyService: CompanyService,
    private esgService: EsgService
  ) {}

  ngOnInit(): void {
    this.companyService.selectedCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        // Only fetch new data if the company has actually changed
        if (this.selectedCompany?.id !== company?.id) {
          this.selectedCompany = company;
          
          // Reset data when company changes
          this.resetData();
          
          // Fetch ESG data if a company is selected
          if (company) {
            this.fetchESGData(company.id);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetData(): void {
    this.esgData = null;
    this.error = null;
    this.errorDetails = null;
  }

  public fetchESGData(companyId: string): void {
    if (!companyId) return;
    
    this.loading = true;
    this.error = null;
    this.errorDetails = null;
    
    this.esgService.getRawData(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.esgData = data;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to load ESG data. Please try again.';
          this.loading = false;
          
          // Extract more detailed error information
          if (err.error instanceof ErrorEvent) {
            // Client-side error
            this.errorDetails = `Client-side error: ${err.error.message}`;
          } else {
            // Server-side error
            this.errorDetails = `Server error: ${err.status} ${err.statusText}`;
            if (err.error) {
              this.errorDetails += ` - ${JSON.stringify(err.error)}`;
            }
          }
          
          console.error('ESG data loading error:', err);
        }
      });
  }
}
