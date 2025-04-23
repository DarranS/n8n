import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Company, CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  template: `
    <mat-form-field appearance="outline" class="company-selector">
      <mat-label>Select a company</mat-label>
      <input type="text"
             matInput
             [formControl]="companyCtrl"
             [matAutocomplete]="auto"
             (click)="showAll()"
             placeholder="Start typing...">
      <mat-autocomplete #auto="matAutocomplete" 
                       [displayWith]="displayFn"
                       (optionSelected)="onCompanySelected($event)">
        <mat-option *ngFor="let company of filteredCompanies | async" [value]="company">
          {{company.name}}
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    
    .company-selector {
      width: 100%;
      background-color: white;
      border-radius: 4px;
    }

    ::ng-deep {
      .mat-mdc-form-field-flex {
        background-color: white !important;
      }

      .mat-mdc-text-field-wrapper {
        background-color: white !important;
      }

      .mat-mdc-form-field-infix {
        min-height: 40px !important;
      }

      .mat-mdc-option {
        font-size: 14px;
        height: 36px;
      }
    }
  `]
})
export class CompanySelectorComponent implements OnInit {
  companyCtrl = new FormControl<Company | string>('');
  filteredCompanies: Observable<Company[]>;
  companies: Company[] = [];

  constructor(private companyService: CompanyService) {
    this.companies = this.companyService.getCompanies();
    this.filteredCompanies = this.companyCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value) return this.companies.slice();
        const name = typeof value === 'string' ? value : value?.name;
        return this._filter(name || '');
      }),
    );
  }

  ngOnInit(): void {
    // Set initial value if there's a selected company
    const currentCompany = this.companyService.getSelectedCompany();
    if (currentCompany) {
      this.companyCtrl.setValue(currentCompany, { emitEvent: false });
    }
  }

  showAll(): void {
    // Show all companies when clicking the input
    const currentValue = this.companyCtrl.value;
    this.companyCtrl.setValue(currentValue, { emitEvent: true });
  }

  displayFn(company: Company | string): string {
    if (typeof company === 'string') return company;
    return company?.name || '';
  }

  private _filter(name: string): Company[] {
    const filterValue = name.toLowerCase();
    // If the filter value matches the current selection exactly, show all companies
    const currentCompany = this.companyService.getSelectedCompany();
    if (currentCompany && currentCompany.name.toLowerCase() === filterValue) {
      return this.companies;
    }
    // Otherwise filter by name
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(filterValue));
  }

  onCompanySelected(event: any): void {
    const company = event.option.value as Company;
    this.companyService.setSelectedCompany(company);
  }
} 