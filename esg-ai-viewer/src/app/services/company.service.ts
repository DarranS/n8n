import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Company {
  id: string; // ISIN
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companies: Company[] = [];
  private selectedCompanySubject = new BehaviorSubject<Company | null>(null);
  selectedCompany$ = this.selectedCompanySubject.asObservable();
  private companiesLoaded = false;

  constructor(private http: HttpClient) {}

  // Loads companies from manifest.json only (no per-company file fetch)
  async loadCompanies(): Promise<Company[]> {
    if (this.companiesLoaded) return this.companies;
    try {
      const manifest = await this.http.get<any[]>('assets/data/manifest.json').toPromise();
      // manifest is an array of objects with ISIN and CompanyName fields
      this.companies = Array.isArray(manifest)
        ? manifest.map(item => ({
            id: item.ISIN || item.ID || '',
            name: item.CompanyName || ''
          })).filter(c => c.id && c.name)
        : [];
      this.companiesLoaded = true;
      console.log('[CompanyService] Loaded companies from manifest:', this.companies);
      return this.companies;
    } catch (err) {
      console.error('[CompanyService] Failed to load manifest.json', err);
      return [];
    }
  }

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