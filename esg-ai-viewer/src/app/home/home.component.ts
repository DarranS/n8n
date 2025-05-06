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
    MatProgressSpinnerModule
  ],
  template: `
    <ng-container *ngIf="!isLoggedIn; else loggedInContent">
      <!-- Welcome page for non-logged in users -->
      <div class="home-container" [class.dark-mode]="isDarkTheme$ | async">
        <h1>Welcome to ESG AI Viewer</h1>
        <div class="content">
          <section class="hero">
            <h2>Intelligent ESG Analysis</h2>
            <p>
              Leverage the power of artificial intelligence to gain deeper insights into Environmental, 
              Social, and Governance (ESG) data. Our platform helps you make informed decisions about 
              corporate sustainability and responsibility.
            </p>
          </section>

          <section class="features">
            <h2>Key Features</h2>
            <div class="feature-grid">
              <div class="feature-card">
                <h3>AI-Powered Analysis</h3>
                <p>Advanced algorithms analyze ESG data to provide meaningful insights and trends.</p>
              </div>
              <div class="feature-card">
                <h3>Interactive Chat</h3>
                <p>Ask questions and get instant answers about company ESG performance.</p>
              </div>
              <div class="feature-card">
                <h3>Comprehensive Data</h3>
                <p>Access detailed ESG metrics and reports from multiple reliable sources.</p>
              </div>
              <div class="feature-card">
                <h3>Real-time Updates</h3>
                <p>Stay informed with the latest ESG developments and company updates.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ng-container>

    <!-- Template for logged-in users -->
    <ng-template #loggedInContent>
      <div class="logged-in-container">
        <app-company-selector></app-company-selector>
        
        <div *ngIf="!selectedCompany" class="no-selection-message">
          <h2>Select a company to view ESG data</h2>
          <p>Use the dropdown above to select a company.</p>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading ESG data...</p>
        </div>

        <div *ngIf="error" class="error-container">
          <h3>Error Loading Data</h3>
          <p>{{ error }}</p>
          <div *ngIf="errorDetails" class="error-details">
            <p>{{ errorDetails }}</p>
          </div>
          <button (click)="retryLoad()" class="retry-button">Retry</button>
        </div>

        <div *ngIf="selectedCompany && esgData && !loading && !error" class="tab-container">
          <mat-tab-group>
            <mat-tab label="Raw Data">
              <app-raw-tab [data]="esgData"></app-raw-tab>
            </mat-tab>
            <mat-tab label="Report">
              <app-report-tab [data]="esgData"></app-report-tab>
            </mat-tab>
            <mat-tab label="Summary">
              <app-summary-tab [data]="esgData"></app-summary-tab>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      transition: background-color 0.3s ease;

      &.dark-mode {
        background-color: #121212;
        color: #ffffff;

        h1 {
          color: #64b5f6;
        }

        h2 {
          color: #e0e0e0;
        }

        p {
          color: #b0b0b0;
        }

        .feature-card {
          background-color: #1e1e1e;
          color: #ffffff;
          border: 1px solid #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(100, 181, 246, 0.2);
            border-color: #64b5f6;
            background-color: #2a2a2a;
          }

          h3 {
            color: #64b5f6 !important;
          }

          p {
            color: #b0b0b0 !important;
          }
        }
      }

      h1 {
        color: #1976d2;
        margin-bottom: 2rem;
        text-align: center;
      }

      .content {
        section {
          margin-bottom: 3rem;

          h2 {
            color: #333;
            margin-bottom: 1.5rem;
          }

          p {
            color: #666;
            line-height: 1.6;
          }
        }

        .hero {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 4rem;
          
          p {
            font-size: 1.2rem;
          }
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;

          .feature-card {
            background-color: #fff;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            h3 {
              color: #1976d2;
              margin: 0 0 1rem 0;
            }

            p {
              margin: 0;
            }
          }
        }
      }

      @media (max-width: 768px) {
        padding: 1rem;

        .hero p {
          font-size: 1.1rem;
        }

        .feature-grid {
          grid-template-columns: 1fr;
        }
      }
    }

    .logged-in-container {
      padding: 2rem;
      margin-top: 1rem;
      
      ::ng-deep .mat-tab-group {
        margin-top: 1rem;
      }

      .no-selection-message {
        text-align: center;
        padding: 2rem;
        background: #f5f5f5;
        border-radius: 8px;
        margin-top: 2rem;

        h2 {
          color: #333;
          margin-bottom: 1rem;
        }

        p {
          color: #666;
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        
        p {
          margin-top: 1rem;
          color: #666;
        }
      }

      .error-container {
        padding: 2rem;
        background: #fff3f3;
        border-radius: 8px;
        margin-top: 2rem;

        h3 {
          color: #d32f2f;
          margin-bottom: 1rem;
        }

        .error-details {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        .retry-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;

          &:hover {
            background: #1565c0;
          }
        }
      }

      .tab-container {
        margin-top: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  `]
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
