import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EsgService {
  private baseUrl = '/webhook'; // Update this to match the proxy path
  private readonly useLocalFiles = true; // Toggle to use local files instead of API

  constructor(private http: HttpClient) {}

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
      map(response => {
        // Handle both string and object responses
        if (typeof response === 'string') {
          return response;
        } else if (response && typeof response === 'object') {
          // If it's an object, convert it to string
          return JSON.stringify(response);
        }
        return '';
      }),
      tap({
        next: (processedResponse) => console.log('Processed response:', processedResponse),
        error: (error) => console.log('Full error details:', error)
      })
    );
  }

  getSummary(data: any): Observable<string> {
    const requestBody = {
      ESGCompanyData: data,
      useRAG: true
    };

    return this.http.post<any>(`${this.baseUrl}/ESG/Company/Summary/Description`, requestBody).pipe(
      map(response => {
        if (typeof response === 'string') {
          return response;
        } else if (response && typeof response === 'object') {
          return JSON.stringify(response);
        }
        return '';
      }),
      tap({
        next: (processedResponse) => console.log('Processed response:', processedResponse),
        error: (error) => console.log('Full error details:', error)
      })
    );
  }

  private processMarkdown(response: string): string {
    console.log('Processing markdown response:', response);
    return response;
  }

  private generateSummaryFromData(data: any): string {
    return "TBD";
  }

  private generateReportFromData(data: any): string {
    return "TBD";
  }
} 