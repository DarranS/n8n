import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RawTabComponent } from '../components/tabs/raw-tab/raw-tab.component';
import { ReportTabComponent } from '../components/tabs/report-tab/report-tab.component';
import { SummaryTabComponent } from '../components/tabs/summary-tab/summary-tab.component';
import { ChatTabComponent } from '../components/tabs/chat-tab/chat-tab.component';
import { Company, CompanyService } from '../services/company.service';
import { EsgService, ESGData } from '../services/esg.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';

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
export class HomeComponent implements OnInit {
  selectedCompany: Company | null = null;
  esgData: ESGData | null = null;
  loading: boolean = false;
  error: string | null = null;
  errorDetails: string | null = null;

  constructor(
    private companyService: CompanyService,
    private esgService: EsgService
  ) {}

  ngOnInit(): void {
    this.companyService.selectedCompany$.subscribe(company => {
      this.selectedCompany = company;
      
      // Reset data when company changes
      this.esgData = null;
      this.error = null;
      this.errorDetails = null;
      
      // Fetch ESG data if a company is selected
      if (company) {
        this.fetchESGData(company.id);
      }
    });
  }

  public fetchESGData(companyId: string): void {
    if (!companyId) return;
    
    this.loading = true;
    this.error = null;
    this.errorDetails = null;
    
    this.esgService.getRawData(companyId).subscribe({
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
