import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { timeout } from 'rxjs/operators';
import { WordExportService } from './word-export.service';

@Injectable({
  providedIn: 'root'
})
export class EsgService {
  private baseUrl = '/webhook'; // Update this to match the proxy path
  private readonly useLocalFiles = true; // Toggle to use local files instead of API
  private currentCompanyData: any = null;
  private rawCompanyData: any = null;

  constructor(private http: HttpClient, private wordExportService: WordExportService) {}

  setCurrentCompanyData(data: any) {
    if (!data) {
      this.currentCompanyData = null;
      this.rawCompanyData = null;
      return;
    }

    this.currentCompanyData = data;
    // When a company is selected, fetch its raw data
    if (data && data.id) {
      this.getRawData(data.id).subscribe(
        rawData => {
          this.rawCompanyData = {
            ...rawData,
            company: data.name,
            companyIsin: data.id
          };
        },
        error => {
          console.error('Error fetching raw data:', error);
          this.rawCompanyData = null;
        }
      );
    } else {
      this.rawCompanyData = null;
    }
  }

  getCurrentCompanyData(): any {
    return this.currentCompanyData;
  }

  getRawCompanyData(): any {
    return this.rawCompanyData;
  }

  getRawData(companyIsin: string): Observable<any> {
    if (this.useLocalFiles) {
      return this.http.get<any>(`assets/data/${companyIsin}.json`).pipe(
        catchError(error => {
          console.error(`Error loading ESG data for ${companyIsin}:`, error);
          return of({
            company: 'Data Not Available',
            companyIsin
          });
        })
      );
    } else {
      const requestBody = {
        "esgid": companyIsin,
        "useRAG": true,
        "length": 1000,
        "ESGCompanyData": {}
      };
      
      return this.http.post<any>(
        `404`,
        requestBody
      );
    }
  }

  getReport(data: any): Observable<string> {
    const requestBody = {
      ESGCompanyData: data,
      useRAG: true
    };

    console.log('Full request details:', {
      url: `${this.baseUrl}/ESG/Company/Summary/Report`,
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return this.http.post<any>(`${this.baseUrl}/ESG/Company/Summary/Report`, requestBody).pipe(
      timeout(600000), // 10 minutes
      map(response => {
        // Extract the relevant data from the response
        const reportData = response?.CompanyESGReport || response;
        // If the response is a string, try to parse it as JSON first
        if (typeof reportData === 'string') {
          try {
            const parsedData = JSON.parse(reportData);
            return this.wordExportService.formatReportData(parsedData);
          } catch (e) {
            // If parsing fails, return the string with newlines handled
            return reportData.replace(/\n/g, '\n');
          }
        } else if (reportData && typeof reportData === 'object') {
          return this.wordExportService.formatReportData(reportData);
        }
        return '';
      }),
      catchError(error => {
        console.error('Error fetching report:', error);
        if (error.status === 502) {
          throw new Error('The backend service is currently unavailable. Please try again later.');
        } else if (error.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error('Failed to fetch the report. Please try again later.');
        }
      }),
      tap({
        next: (processedResponse) => console.log('Processed response:', processedResponse),
        error: (error) => console.log('Full error details:', error)
      })
    );
  }

  getSummary(data: any, refreshRagData: boolean = false): Observable<string> {
    // Get the ISIN/ID from either the input data or current company data
    const esgID = data?.id || this.currentCompanyData?.id;
    if (!esgID) {
      console.error('No company ID available', {
        inputData: data,
        currentCompanyData: this.currentCompanyData
      });
    }
    const requestBody = {
      ESGCompanyData: data,
      useRAG: data?.useRAG ?? true,
      summaryLength: data?.length ?? 1000,
      esgID: esgID,
      refreshRAGData: refreshRagData
    };
    console.log('Current company data:', this.currentCompanyData);
    console.log('ESG Data:', data);
    console.log('Summary request body:', requestBody);
    return this.http.post<any>(`${this.baseUrl}/ESG/Company/Summary/Description`, requestBody).pipe(
      timeout(600000), // 10 minutes
      map(response => {
        // Extract the relevant data from the response
        const summaryData = response?.CompanyESGSummary || response;
        // If the response is a string, try to parse it as JSON first
        if (typeof summaryData === 'string') {
          try {
            const parsedData = JSON.parse(summaryData);
            return this.wordExportService.formatSummaryData(parsedData);
          } catch (e) {
            // If parsing fails, return the string with newlines handled
            return summaryData.replace(/\n/g, '\n');
          }
        } else if (summaryData && typeof summaryData === 'object') {
          return this.wordExportService.formatSummaryData(summaryData);
        }
        return '';
      }),
      tap({
        next: (processedResponse) => console.log('Processed summary response:', processedResponse),
        error: (error) => console.log('Full error details:', error)
      })
    );
  }


  askQuestion(prompt: string): Observable<string> {
    // Always use the remote endpoint
    const url = `${this.baseUrl}/Question`;
    const body = { Prompt: prompt };
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(url, body, { headers, responseType: 'text' }).pipe(
      timeout(180000)
    );
  }

  // Fetches the list of ISINs in the RAG database from the n8n endpoint
  public async fetchRagIsins(): Promise<Set<string>> {
    try {
      const ragData = await this.http.get<any[]>(
        `${this.baseUrl}/ESGRagIDs`
      ).toPromise();

      if (!Array.isArray(ragData)) {
        console.error('[EsgService] Unexpected response for RAG ISINs:', ragData);
        return new Set();
      }

      // ragData is an array of objects with an 'esgid' field
      return new Set(ragData.map(item => (item.esgid || '').toUpperCase()).filter(Boolean));
    } catch (err: any) {
      if (err && err.error) {
        // Try to parse and log the full error message from n8n
        try {
          const errorObj = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
          console.error('[EsgService] Failed to fetch RAG ISINs:', errorObj);
        } catch (parseErr) {
          console.error('[EsgService] Failed to fetch RAG ISINs (unparsable error):', err.error);
        }
      } else {
        console.error('[EsgService] Failed to fetch RAG ISINs', err);
      }
      return new Set();
    }
  }
} 