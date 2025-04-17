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

  constructor(private companyService: CompanyService) {
    this.companies = this.companyService.getCompanies();
  }

  ngOnInit(): void {
    this.filteredCompanies = this.companyControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name || '';
        return name ? this._filter(name) : this.companies.slice();
      })
    );
  }

  displayFn(company: Company): string {
    return company && company.name ? company.name : '';
  }

  private _filter(value: string): Company[] {
    const filterValue = value.toLowerCase();
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(filterValue)
    );
  }

  onCompanySelected(company: Company): void {
    this.companyService.setSelectedCompany(company);
  }

  clearSelection(): void {
    this.companyControl.setValue('');
    this.companyService.clearSelection();
  }
} 