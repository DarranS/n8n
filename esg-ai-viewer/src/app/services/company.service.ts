import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EsgService } from './esg.service';

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
  private fullCompanyUniverse: any[] = [];
  private fullCompanyUniverseLoaded = false;

  constructor(private http: HttpClient, private esgService: EsgService) {}

  // Loads companies from CompanyUniverse.json only (no per-company file fetch)
  async loadCompanies(): Promise<Company[]> {
    if (this.companiesLoaded) return this.companies;
    try {
      const companyUniverse = await this.http.get<any[]>("assets/data/CompanyUniverse.json").toPromise();
      // CompanyUniverse is an array of objects with ISIN and CompanyName fields
      this.companies = Array.isArray(companyUniverse)
        ? companyUniverse.map(item => ({
            id: item.ISIN || item.ID || '',
            name: item.CompanyName || ''
          })).filter(c => c.id && c.name)
        : [];
      this.companiesLoaded = true;
      return this.companies;
    } catch (err) {
      console.error('[CompanyService] Failed to load CompanyUniverse.json', err);
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

  // Loads the full CompanyUniverse.json data (all fields), optionally merging RAG details
  async getFullCompanyUniverse(IncludeRAGDetails: boolean = false): Promise<any[]> {
    if (this.fullCompanyUniverseLoaded && !IncludeRAGDetails) return this.fullCompanyUniverse;
    try {
      const data = await this.http.get<any[]>("assets/data/CompanyUniverse.json").toPromise();
      let universe = Array.isArray(data) ? data : [];
      if (IncludeRAGDetails) {
        const ragIsins = await this.esgService.fetchRagIsins();
        universe = universe.map(company => ({
          ...company,
          InRAG: ragIsins.has((company.ISIN || '').toUpperCase())
        }));
      }
      if (!IncludeRAGDetails) {
        this.fullCompanyUniverse = universe;
        this.fullCompanyUniverseLoaded = true;
      }
      return universe;
    } catch (err) {
      console.error('[CompanyService] Failed to load full CompanyUniverse.json', err);
      return [];
    }
  }

  // Optionally, select a company by ISIN from the full data
  selectCompanyByISIN(isin: string): void {
    const found = this.fullCompanyUniverse.find(c => c.ISIN === isin);
    if (found) {
      this.setSelectedCompany({ id: found.ISIN, name: found.CompanyName });
    }
  }
} 