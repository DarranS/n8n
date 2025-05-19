import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RawTabComponent } from '../../components/tabs/raw-tab/raw-tab.component';
import { ReportTabComponent } from '../../components/tabs/report-tab/report-tab.component';
import { SummaryTabComponent } from '../../components/tabs/summary-tab/summary-tab.component';
import { CompanySelectorComponent } from '../../components/company-selector/company-selector.component';
import { AuthService } from '../../auth/auth.service';
import { CompanyService, Company } from '../../services/company.service';
import { EsgService } from '../../services/esg.service';
import { ThemeService } from '../../services/theme.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { QuestionTabComponent } from '../../components/tabs/question-tab/question-tab.component';
import { Router } from '@angular/router';

interface EsgData {
  id: string;
  [key: string]: any; // Add specific fields as needed
}

@Component({
  selector: 'app-research-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    RawTabComponent,
    ReportTabComponent,
    SummaryTabComponent,
    CompanySelectorComponent,
    MatProgressSpinnerModule,
    QuestionTabComponent
  ],
  templateUrl: './research-home.component.html',
  styleUrls: ['./research-home.component.scss']
})
export class ResearchHomeComponent implements OnInit, OnDestroy {
  selectedCompany: Company | null = null;
  esgData: EsgData | null = null;
  loading = false;
  error: string | null = null;
  errorDetails: string | null = null;
  private destroy$ = new Subject<void>();
  isDarkTheme$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private esgService: EsgService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.resetState();
    this.setupCompanySubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.companyService.clearSelection();
  }

  private resetState(): void {
    this.selectedCompany = null;
    this.esgData = null;
    this.error = null;
    this.errorDetails = null;
  }

  private setupCompanySubscription(): void {
    this.companyService.selectedCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe((company: Company | null) => {
        this.selectedCompany = company;
        if (company) {
          this.loadEsgData(company.id);
        } else {
          this.resetState();
        }
      });
  }

  private handleError(err: HttpErrorResponse): void {
    this.loading = false;
    this.error = 'Failed to load ESG data';
    
    if (err.error instanceof ErrorEvent) {
      this.errorDetails = `Client error: ${err.error.message}`;
    } else {
      this.errorDetails = `Server error: ${err.status} ${err.statusText}`;
      if (err.error) {
        this.errorDetails += ` - ${JSON.stringify(err.error)}`;
      }
    }
  }

  private loadEsgData(companyId: string): void {
    if (!companyId) return;

    this.loading = true;
    this.error = null;
    this.errorDetails = null;

    this.esgService.getRawData(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.esgData = {
            ...data,
            id: companyId
          };
          this.esgService.setCurrentCompanyData({
            ...this.selectedCompany,
            ...this.esgData
          });
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
  }

  retryLoad(): void {
    if (this.selectedCompany) {
      this.loadEsgData(this.selectedCompany.id);
    }
  }
}
