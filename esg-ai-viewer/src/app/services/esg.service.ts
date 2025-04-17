import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ESGData {
  company: string;
  companyIsin: string;
  sector: string;
  lastUpdated: string;
  environmental: any;
  social: any;
  governance: any;
  overallESGScore: number;
  controversies: any[];
  recommendations: string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class EsgService {
  private readonly baseUrl = 'https://n8n.sheltononline.com/webhook/ESG';
  private readonly useLocalFiles = true; // Toggle to use local files instead of API

  constructor(private http: HttpClient) {}

  getRawData(companyIsin: string): Observable<ESGData> {
    if (this.useLocalFiles) {
      return this.http.get<ESGData>(`assets/data/${companyIsin}.json`).pipe(
        map(data => {
          return { ...data, companyIsin };
        }),
        catchError(error => {
          console.error(`Error loading ESG data for ${companyIsin}:`, error);
          return of({
            company: 'Data Not Available',
            companyIsin,
            sector: 'N/A',
            lastUpdated: new Date().toISOString().split('T')[0],
            environmental: { overallScore: 0 },
            social: { overallScore: 0 },
            governance: { overallScore: 0 },
            overallESGScore: 0,
            controversies: [],
            recommendations: ['No data available for this company']
          } as ESGData);
        })
      );
    } else {
      const requestBody = {
        "esgid": companyIsin,
        "useRAG": true,
        "ESGCompanyData": {}
      };
      
      return this.http.post<ESGData>(
        `${this.baseUrl}/Company/Data`,
        requestBody
      ).pipe(
        map(data => {
          return { ...data, companyIsin };
        })
      );
    }
  }

  getReport(data: ESGData): Observable<string> {
    if (this.useLocalFiles) {
      // Generate a simple report from the JSON data
      return of(this.generateReportFromData(data));
    } else {
      const requestBody = {
        "esgid": data.companyIsin,
        "useRAG": true,
        "ESGCompanyData": data
      };
      
      return this.http.post<string>(
        `${this.baseUrl}/Company/Summary/Report`,
        requestBody
      ).pipe(
        map(response => this.processMarkdown(response))
      );
    }
  }

  getSummary(data: ESGData): Observable<string> {
    if (this.useLocalFiles) {
      // Generate a simple summary from the JSON data
      return of(this.generateSummaryFromData(data));
    } else {
      const requestBody = {
        "esgid": data.companyIsin,
        "useRAG": true,
        "ESGCompanyData": data
      };
      
      return this.http.post<string>(
        `${this.baseUrl}/Company/Summary/Description`,
        requestBody
      ).pipe(
        map(response => this.processMarkdown(response))
      );
    }
  }

  private processMarkdown(markdown: string): string {
    return markdown.replace(/\\n/g, '\r\n');
  }

  private generateSummaryFromData(data: ESGData): string {
    const summary = `# ESG Summary for ${data.company}
    
## Overview
${data.company} is in the ${data.sector} sector with an overall ESG score of ${data.overallESGScore}/100.

## Key Metrics
- **Environmental**: ${data.environmental.overallScore}/100
- **Social**: ${data.social.overallScore}/100
- **Governance**: ${data.governance.overallScore}/100

## Strengths
- Strong performance in ${this.findHighestCategory(data)}.
- ${this.getRecommendation(data.recommendations, 0) || 'No specific strengths highlighted.'}

## Areas for Improvement
- ${this.getRecommendation(data.recommendations, 1) || 'No specific improvements recommended.'}

## Recent Controversies
${this.formatControversies(data.controversies)}

*Last updated: ${data.lastUpdated}*
`;
    return summary;
  }

  private generateReportFromData(data: ESGData): string {
    const report = `# Detailed ESG Report: ${data.company}
    
## Company Profile
- **Name**: ${data.company}
- **Sector**: ${data.sector}
- **Overall ESG Score**: ${data.overallESGScore}/100
- **Last Updated**: ${data.lastUpdated}

## Environmental Performance (Score: ${data.environmental.overallScore}/100)

### Carbon Emissions (${data.environmental.carbonEmissions.score}/100)
${data.environmental.carbonEmissions.details}

**Metrics**:
- Scope 1: ${data.environmental.carbonEmissions.metrics.scope1} ${data.environmental.carbonEmissions.metrics.unit}
- Scope 2: ${data.environmental.carbonEmissions.metrics.scope2} ${data.environmental.carbonEmissions.metrics.unit}
- Scope 3: ${data.environmental.carbonEmissions.metrics.scope3} ${data.environmental.carbonEmissions.metrics.unit}

### Water Management (${data.environmental.waterManagement.score}/100)
${data.environmental.waterManagement.details}

### Waste Management (${data.environmental.wasteManagement.score}/100)
${data.environmental.wasteManagement.details}

## Social Performance (Score: ${data.social.overallScore}/100)

### Labor Practices (${data.social.laborPractices.score}/100)
${data.social.laborPractices.details}

### Diversity (${data.social.diversity.score}/100)
${data.social.diversity.details}

### Community Impact (${data.social.communityImpact.score}/100)
${data.social.communityImpact.details}

## Governance Performance (Score: ${data.governance.overallScore}/100)

### Board Composition (${data.governance.boardComposition.score}/100)
${data.governance.boardComposition.details}

### Executive Compensation (${data.governance.executiveCompensation.score}/100)
${data.governance.executiveCompensation.details}

### Ethics and Transparency (${data.governance.ethicsAndTransparency.score}/100)
${data.governance.ethicsAndTransparency.details}

## Controversies
${this.formatControversies(data.controversies)}

## Recommendations for Improvement
${this.formatRecommendations(data.recommendations)}

*This report is based on data last updated on ${data.lastUpdated}.*
`;
    return report;
  }

  private findHighestCategory(data: ESGData): string {
    const categories = [
      { name: 'Environmental', score: data.environmental.overallScore },
      { name: 'Social', score: data.social.overallScore },
      { name: 'Governance', score: data.governance.overallScore }
    ];
    
    return categories.sort((a, b) => b.score - a.score)[0].name;
  }

  private getRecommendation(recommendations: string[], index: number): string {
    return recommendations && recommendations.length > index ? recommendations[index] : '';
  }

  private formatControversies(controversies: any[]): string {
    if (!controversies || controversies.length === 0) {
      return 'No significant controversies reported.';
    }
    
    return controversies.map(c => `- **${c.issue}** (${c.severity}, ${c.date}): Status - ${c.resolution}`).join('\n');
  }

  private formatRecommendations(recommendations: string[]): string {
    if (!recommendations || recommendations.length === 0) {
      return 'No specific recommendations at this time.';
    }
    
    return recommendations.map(r => `- ${r}`).join('\n');
  }
} 