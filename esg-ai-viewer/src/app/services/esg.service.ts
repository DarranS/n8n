import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EsgService {
  private baseUrl = '/webhook'; // Update this to match the proxy path
  private readonly useLocalFiles = true; // Toggle to use local files instead of API
  private currentCompanyData: any = null;
  private rawCompanyData: any = null;

  constructor(private http: HttpClient) {}

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
            return this.formatReportData(parsedData);
          } catch (e) {
            // If parsing fails, return the string with newlines handled
            return reportData.replace(/\\n/g, '\n');
          }
        } else if (reportData && typeof reportData === 'object') {
          return this.formatReportData(reportData);
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

  private formatReportData(data: any): string {
    // If the data has a specific structure, format it accordingly
    if (data.CompanyESGReport) {
      return this.formatCompanyESGReport(data.CompanyESGReport);
    } else if (data.Report) {
      return this.formatCompanyESGReport(data.Report);
    } else if (typeof data === 'string') {
      return data.replace(/\\n/g, '\n');
    } else {
      // For any other object structure, convert to string with proper formatting
      return JSON.stringify(data, null, 2).replace(/\\n/g, '\n');
    }
  }

  private formatCompanyESGReport(report: any): string {
    if (typeof report === 'string') {
      return report.replace(/\\n/g, '\n');
    }
    
    // If it's an object, try to extract the most relevant content
    const content = report.content || report.text || report.data || report;
    
    if (typeof content === 'string') {
      return content.replace(/\\n/g, '\n');
    }
    
    // If we still have an object, convert it to a formatted string
    return JSON.stringify(content, null, 2).replace(/\\n/g, '\n');
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
            return this.formatSummaryData(parsedData);
          } catch (e) {
            // If parsing fails, return the string with newlines handled
            return summaryData.replace(/\\n/g, '\n');
          }
        } else if (summaryData && typeof summaryData === 'object') {
          return this.formatSummaryData(summaryData);
        }
        return '';
      }),
      tap({
        next: (processedResponse) => console.log('Processed summary response:', processedResponse),
        error: (error) => console.log('Full error details:', error)
      })
    );
  }

  private formatSummaryData(data: any): string {
    // If the data has a specific structure, format it accordingly
    if (data.CompanyESGSummary) {
      return this.formatCompanyESGSummary(data.CompanyESGSummary);
    } else if (data.output) {
      return this.formatCompanyESGSummary(data.output);
    } else if (typeof data === 'string') {
      return data.replace(/\\n/g, '\n');
    } else {
      // For any other object structure, convert to string with proper formatting
      return JSON.stringify(data, null, 2).replace(/\\n/g, '\n');
    }
  }

  private formatCompanyESGSummary(summary: any): string {
    if (typeof summary === 'string') {
      // Process markdown in the string
      return this.processMarkdown(summary.replace(/\\n/g, '\n'));
    }
    
    // If it's an object, try to extract the most relevant content
    const content = summary.content || summary.text || summary.data || summary.description || summary.output || summary;
    
    if (typeof content === 'string') {
      // Process markdown in the extracted content
      return this.processMarkdown(content.replace(/\\n/g, '\n'));
    }
    
    // If we still have an object, convert it to a formatted string and process markdown
    const stringContent = JSON.stringify(content, null, 2).replace(/\\n/g, '\n');
    return this.processMarkdown(stringContent);
  }

  private processMarkdown(response: string): string {
    // Ensure proper markdown formatting
    let processed = response;
    
    // Handle common markdown patterns
    processed = processed
      // Handle headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Handle bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle lists
      .replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>')
      .replace(/^\s*-\s(.*$)/gm, '<li>$1</li>')
      // Handle links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Handle paragraphs (ensure proper spacing)
      .replace(/\n\n/g, '</p><p>')
      // Wrap the entire content in a paragraph if needed
      .replace(/^(?!<[a-z])(.*)$/gm, '<p>$1</p>');
    
    console.log('Processed markdown:', processed);
    return processed;
  }

  private generateSummaryFromData(data: any): string {
    return "TBD";
  }

  private generateReportFromData(data: any): string {
    return "TBD";
  }

  askQuestion(prompt: string): Observable<string> {
    // Always use the remote endpoint
    const url = 'https://n8n.sheltononline.com/webhook/Question';
    const body = { Prompt: prompt };
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(url, body, { headers, responseType: 'text' });
  }
} 