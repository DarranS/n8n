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

  // Loads companies from JSON files in assets/data using a manifest
  async loadCompanies(): Promise<Company[]> {
    if (this.companiesLoaded) return this.companies;
    // Load manifest.json first
    let files: string[] = [];
    try {
      const manifest = await this.http.get<string[]>('assets/data/manifest.json').toPromise();
      files = Array.isArray(manifest) ? manifest : [];
      console.log('[CompanyService] Loaded manifest.json:', files);
    } catch (err) {
      console.error('[CompanyService] Failed to load manifest.json', err);
      return [];
    }
    const promises = files.map(file =>
      this.http.get<any>(`assets/data/${file}`).toPromise()
        .then(json => {
          console.log(`[CompanyService] Loaded file: ${file} (Company: ${json.name})`);
          return { id: file.replace('.json', ''), name: json.name };
        })
        .catch((err) => {
          console.warn(`[CompanyService] Failed to load file: ${file}`, err);
          return null;
        })
    );
    const results = await Promise.all(promises);
    this.companies = results.filter(Boolean) as Company[];
    this.companiesLoaded = true;
    console.log('[CompanyService] Loaded companies:', this.companies);
    return this.companies;
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