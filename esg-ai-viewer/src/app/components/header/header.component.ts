import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Company, CompanyService } from '../../services/company.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EsgService } from '../../services/esg.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    RouterModule, 
    CommonModule, 
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatToolbarModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  title = 'ESG AI Viewer';
  companyControl = new FormControl<string | Company>('');
  filteredCompanies: Observable<Company[]> = new Observable<Company[]>();
  companies: Company[] = [];

  constructor(private companyService: CompanyService, private esgService: EsgService) {
    this.companies = this.companyService.getCompanies();
    
    // Subscribe to selected company changes to update the form control
    this.companyService.selectedCompany$.subscribe(company => {
      if (company) {
        this.companyControl.setValue(company, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.filteredCompanies = this.companyControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value) {
          return this.companies;
        }
        const searchStr = typeof value === 'string' ? value : value.name;
        return this._filter(searchStr || '');
      })
    );

    // Subscribe to value changes to handle selection
    this.companyControl.valueChanges.subscribe(value => {
      if (value && typeof value !== 'string') {
        this.esgService.setCurrentCompanyData(value);
        this.companyService.setSelectedCompany(value);
      }
    });
  }

  displayFn(company: Company): string {
    return company && company.name ? `${company.name} (${company.id})` : '';
  }

  private _filter(value: string): Company[] {
    const filterValue = value.toLowerCase();
    // If the filter value is empty or matches the currently selected company exactly,
    // return all companies
    if (!filterValue || (this.companyControl.value && typeof this.companyControl.value !== 'string' && 
        this.companyControl.value.name.toLowerCase() === filterValue)) {
      return this.companies;
    }
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(filterValue) ||
      company.id.toLowerCase().includes(filterValue)
    );
  }

  clearSelection(): void {
    this.companyControl.setValue('');
    this.companyService.clearSelection();
  }

  onInputClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.select();
    }
  }
} 