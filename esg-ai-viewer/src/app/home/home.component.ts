import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RawTabComponent } from '../components/tabs/raw-tab/raw-tab.component';
import { ReportTabComponent } from '../components/tabs/report-tab/report-tab.component';
import { SummaryTabComponent } from '../components/tabs/summary-tab/summary-tab.component';
import { CompanySelectorComponent } from '../components/company-selector/company-selector.component';
import { AuthService } from '../auth/auth.service';
import { CompanyService } from '../services/company.service';
import { EsgService } from '../services/esg.service';
import { ThemeService } from '../services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { QuestionTabComponent } from '../components/tabs/question-tab/question-tab.component';
import { TestComponent } from '../components/tabs/question-tab/test.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    RawTabComponent,
    ReportTabComponent,
    SummaryTabComponent,
    CompanySelectorComponent,
    MatProgressSpinnerModule,
    QuestionTabComponent,
    TestComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  selectedCompany: any = null;
  esgData: any = null;
  loading = false;
  error: string | null = null;
  errorDetails: string | null = null;
  private destroy$ = new Subject<void>();
  isDarkTheme$;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private esgService: EsgService,
    private themeService: ThemeService
  ) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Subscribe to company selection changes
    this.companyService.selectedCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.selectedCompany = company;
        if (company) {
          this.loadEsgData(company.id);
        } else {
          this.esgData = null;
          this.error = null;
          this.errorDetails = null;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEsgData(companyId: string) {
    if (!companyId) return;

    this.loading = true;
    this.error = null;
    this.errorDetails = null;

    this.esgService.getRawData(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
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
        error: (err: HttpErrorResponse) => {
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
      });
  }

  retryLoad() {
    if (this.selectedCompany) {
      this.loadEsgData(this.selectedCompany.id);
    }
  }
}
