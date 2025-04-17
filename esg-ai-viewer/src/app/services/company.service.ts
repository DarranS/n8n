import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Company {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  // Actual companies with their ISINs
  private companies: Company[] = [
    { id: 'US0378331005', name: 'APPLE' },
    { id: 'US67066G1040', name: 'NVIDIA' },
    { id: 'US5949181045', name: 'MICROSOFT CORP' },
    { id: 'US0231351067', name: 'AMAZON.COM' },
    { id: 'US30303M1027', name: 'META PLATFORMS A' },
    { id: 'US02079K3059', name: 'ALPHABET A' },
    { id: 'US02079K1079', name: 'ALPHABET C' },
    { id: 'US88160R1014', name: 'TESLA' },
    { id: 'US11135F1012', name: 'BROADCOM' },
    { id: 'US0846707026', name: 'BERKSHIRE HATHAWAY B' },
    { id: 'US46625H1005', name: 'JPMORGAN CHASE & CO' }
  ];

  private selectedCompanySubject = new BehaviorSubject<Company | null>(null);
  selectedCompany$ = this.selectedCompanySubject.asObservable();

  constructor() {}

  getCompanies(): Company[] {
    return this.companies;
  }

  setSelectedCompany(company: Company | null): void {
    this.selectedCompanySubject.next(company);
  }

  getSelectedCompany(): Company | null {
    return this.selectedCompanySubject.value;
  }

  clearSelection(): void {
    this.selectedCompanySubject.next(null);
  }
} 