import { Injectable } from '@angular/core';
import { EsgService } from './esg.service';
import { WordExportService } from './word-export.service';
import { Paragraph, Table, HeadingLevel } from 'docx';

export interface ExportOptionsResult {
  includePrompt?: boolean;
  includeAnswer?: boolean;
  includeReportData?: boolean;
  fileName?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportExportService {
  constructor(
    private esgService: EsgService,
    private wordExportService: WordExportService
  ) {}

  // Retry getReport with exponential backoff
  private async retryGetReport(rawData: any, maxRetries = 3, delays = [20000, 40000, 60000]): Promise<string> {
    let lastError: any = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.esgService.getReport(rawData).toPromise();
        return result ?? '';
      } catch (e) {
        lastError = e;
        if (attempt < maxRetries - 1) {
          const delay = delays[attempt] || delays[delays.length - 1];
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }
    throw lastError;
  }

  /**
   * Export a guided question and its answer to a Word document (single company)
   */
  async exportGuidedQuestionToWord(params: {
    companyName: string;
    companyIsin: string;
    generatedPrompt: string;
    answer: string;
    options?: ExportOptionsResult;
    rawCompanyData: any;
  }): Promise<void> {
    const { companyName, companyIsin, generatedPrompt, answer, options, rawCompanyData } = params;
    if (!companyName || !companyIsin || !generatedPrompt || !answer) return;
    let answerText = answer;
    try {
      const parsed = JSON.parse(answer || "");
      if (parsed.output) answerText = parsed.output;
    } catch {}
    const children: (Paragraph | Table)[] = [];
    children.push(new Paragraph({
      text: `${companyName} (ISIN: ${companyIsin})`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }));
    if (!options || options.includePrompt) {
      children.push(new Paragraph({
        text: 'Prompt:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }));
      children.push(new Paragraph({
        text: generatedPrompt,
        spacing: { after: 300 },
      }));
    }
    if (!options || options.includeAnswer) {
      children.push(new Paragraph({
        text: 'Response:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }));
      const answerParagraphs = answerText.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
      const answerDocParagraphs = answerParagraphs.map(p => new Paragraph({ text: p }));
      children.push(...answerDocParagraphs);
    }
    if (options && options.includeReportData) {
      children.push(new Paragraph({ pageBreakBefore: true }));
      children.push(new Paragraph({
        text: 'Report Data:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }));
      try {
        const reportData = await this.retryGetReport(rawCompanyData);
        const safeReportData = typeof reportData === 'string' ? reportData : '';
        const reportDocElements = this.wordExportService.markdownToDocxElements(safeReportData);
        children.push(...reportDocElements);
      } catch (e) {
        children.push(new Paragraph({ text: 'Failed to load report data.' }));
      }
    }
    const fileName = options?.fileName || `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Guided_Question.docx`;
    await this.wordExportService.exportWordDocument(children, fileName);
  }

  /**
   * Export a batch of guided questions/answers for multiple companies
   */
  async exportBatchGuidedQuestionsToWord(params: {
    companies: { CompanyName: string; ISIN: string }[];
    generatedPrompt: string;
    result: ExportOptionsResult;
    askQuestion: (prompt: string, idx: number, total: number) => Promise<string>;
    onStatus?: (msg: string) => void;
  }): Promise<void> {
    const { companies, generatedPrompt, result, askQuestion, onStatus } = params;
    let errors: string[] = [];
    let allChildren: any[] = [];
    let idx = 0;
    for (const company of companies) {
      if (onStatus) onStatus(`Processing Company ${idx + 1} of ${companies.length}...`);
      try {
        // Replace placeholders with actual company data
        const prompt = generatedPrompt
          .replace(/\{\{COMPANY_NAME\}\}/g, company.CompanyName)
          .replace(/\{\{COMPANY_ISIN\}\}/g, company.ISIN);
        const res = await askQuestion(prompt, idx, companies.length);
        let answerText = res;
        try {
          const parsed = JSON.parse(res || "");
          if (parsed.output) answerText = parsed.output;
        } catch {}
        allChildren.push({ company, prompt, answer: answerText || '' });
      } catch (e: any) {
        errors.push(`${company.CompanyName} (${company.ISIN}): ${e?.message || 'Error'}`);
      }
      idx++;
    }
    let docChildren = allChildren.flatMap(({ company, prompt, answer }, idx) => [
      ...(idx > 0 ? [new Paragraph({ pageBreakBefore: true })] : []),
      new Paragraph({ text: `${company.CompanyName} (ISIN: ${company.ISIN})`, heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }),
      ...(result.includePrompt ? [new Paragraph({ text: 'Prompt:', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }), new Paragraph({ text: (prompt || ''), spacing: { after: 300 } })] : []),
      ...(result.includeAnswer ? [new Paragraph({ text: 'Response:', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }), ...((answer || '').split(/\r?\n/).map((p: string) => new Paragraph({ text: p.trim() })))] : [])
    ]);
    // Fetch and append report data for each company if requested
    if (result.includeReportData) {
      const reportSections: any[] = [];
      for (let rIdx = 0; rIdx < companies.length; rIdx++) {
        const company = companies[rIdx];
        if (onStatus) onStatus(`Fetching report data for Company ${rIdx + 1} of ${companies.length}...`);
        try {
          const rawData = await this.esgService.getRawData(company.ISIN).toPromise();
          const report = await this.retryGetReport(rawData);
          const safeReport = typeof report === 'string' ? report : '';
          reportSections.push([
            new Paragraph({ pageBreakBefore: true }),
            new Paragraph({ text: `${company.CompanyName} (ISIN: ${company.ISIN}) - Report Data`, heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }),
            ...this.wordExportService.markdownToDocxElements(safeReport)
          ]);
        } catch (e) {
          reportSections.push([
            new Paragraph({ pageBreakBefore: true }),
            new Paragraph({ text: `${company.CompanyName} (ISIN: ${company.ISIN}) - Report Data`, heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }),
            new Paragraph({ text: 'Failed to load report data.' })
          ]);
        }
      }
      docChildren = [...docChildren, ...reportSections.flat()];
    }
    const fileName = result.fileName || 'Batch_Questions.docx';
    await this.wordExportService.exportWordDocument(docChildren, fileName);
    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  }

  /**
   * Export a simple question and its answer to a Word document (single company)
   */
  async exportSimpleQuestionToWord(params: {
    companyName: string;
    companyIsin: string;
    prompt: string;
    answer: string;
    options?: ExportOptionsResult;
    rawCompanyData: any;
  }): Promise<void> {
    const { companyName, companyIsin, prompt, answer, options, rawCompanyData } = params;
    if (!companyName || !companyIsin || !prompt || !answer) return;
    let answerText = answer;
    try {
      const parsed = JSON.parse(answer || "");
      if (parsed.output) answerText = parsed.output;
    } catch {}
    const children: (Paragraph | Table)[] = [];
    children.push(new Paragraph({
      text: `${companyName} (ISIN: ${companyIsin})`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }));
    if (!options || options.includePrompt) {
      children.push(new Paragraph({
        text: 'Prompt:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }));
      children.push(new Paragraph({
        text: prompt,
        spacing: { after: 300 },
      }));
    }
    if (!options || options.includeAnswer) {
      children.push(new Paragraph({
        text: 'Response:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }));
      const answerParagraphs = answerText.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
      const answerDocParagraphs = answerParagraphs.map(p => new Paragraph({ text: p }));
      children.push(...answerDocParagraphs);
    }
    if (options && options.includeReportData) {
      children.push(new Paragraph({ pageBreakBefore: true }));
      children.push(new Paragraph({
        text: 'Report Data:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }));
      try {
        const reportData = await this.retryGetReport(rawCompanyData);
        const safeReportData = typeof reportData === 'string' ? reportData : '';
        const reportDocElements = this.wordExportService.markdownToDocxElements(safeReportData);
        children.push(...reportDocElements);
      } catch (e) {
        children.push(new Paragraph({ text: 'Failed to load report data.' }));
      }
    }
    const fileName = options?.fileName || `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Simple_Question.docx`;
    await this.wordExportService.exportWordDocument(children, fileName);
  }
} 