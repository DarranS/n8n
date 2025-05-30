import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { EsgService } from '../../../services/esg.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
// @ts-ignore
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell } from 'docx';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExportOptionsDialogComponent, ExportOptionsResult } from './export-options-dialog.component';
import { WordExportService } from '../../../services/word-export.service';

@Component({
  selector: 'app-question-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule
  ],
  templateUrl: './question-tab.component.html',
  styleUrls: ['./question-tab.component.scss']
})
export class QuestionTabComponent {
  @Input() companyName: string = '';
  @Input() companyIsin: string = '';

  // Tab state
  private _selectedTabIndex: number = 0;
  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }
  set selectedTabIndex(value: number) {
    // If switching from Guided (1) to Simple (0), copy generatedPrompt to simplePrompt
    if (this._selectedTabIndex === 1 && value === 0 && this.generatedPrompt) {
      this.simplePrompt = this.generatedPrompt;
    }
    this._selectedTabIndex = value;
  }

  // Simple tab state
  simplePrompt: string = '';

  // Guided tab state
  question: string = '';
  audience: string = 'Customer';
  tone: string = 'Professional';
  depth: string = 'Brief';
  perspective: string = '';
  includeNumericData: boolean = false;
  generatedPrompt: string = '';

  answer: string = '';
  loading = false;
  error: string | null = null;
  public formattedAnswer: SafeHtml = '';

  outputFormat: string = 'Text Block';
  includePromptIntention: boolean = false;
  outputFormatOptions = [
    { value: 'Email', tooltip: "Structured with a formal salutation, body, and closing, suitable for professional correspondence." },
    { value: 'Social Post', tooltip: "Concise, engaging, and formatted for platforms like X, targeting under 280 characters. Summarize content if needed to fit." },
    { value: 'Text Block', tooltip: "A narrative paragraph or set of paragraphs suitable for inclusion in reports, presentations, or other documents." }
  ];
  warning: string | null = null;

  audienceOptions = [
    { value: 'Prospect', tooltip: 'A potential investor or client considering the company.' },
    { value: 'Customer', tooltip: 'An existing client or user of the company\'s products/services.' },
    { value: 'Relationship Manager', tooltip: 'A professional managing client relationships with the company.' },
    { value: 'Investment Manager', tooltip: 'A professional overseeing investment decisions.' },
    { value: 'Expert', tooltip: 'A subject matter expert in ESG or the company\'s industry.' },
    { value: 'General Employee', tooltip: 'A regular employee of the company or related organization.' }
  ];
  toneOptions = [
    { value: 'Professional', tooltip: 'Formal and business-like language.' },
    { value: 'Casual', tooltip: 'Informal and conversational language.' },
    { value: 'Technical', tooltip: 'Detailed and jargon-heavy language for experts.' }
  ];
  depthOptions = [
    { value: 'Brief', tooltip: 'A short and concise response.' },
    { value: 'Detailed', tooltip: 'A thorough and comprehensive response.' },
    { value: 'Executive Summary', tooltip: 'A high-level overview for decision-makers.' }
  ];

  constructor(private http: HttpClient, private esgService: EsgService, private sanitizer: DomSanitizer, private dialog: MatDialog, private wordExportService: WordExportService) {}

  // Simple tab ask
  askSimpleQuestion() {
    if (!this.simplePrompt.trim()) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    const prefix = `For  ${this.companyName} ISIN:${this.companyIsin}: `;
    const fullPrompt = prefix + this.simplePrompt.trim();
    this.esgService.askQuestion(fullPrompt).subscribe({
      next: (res: string) => {
        let output = res;
        try {
          const parsed = JSON.parse(res);
          if (parsed.output) output = parsed.output;
        } catch {}
        this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
          this.esgService['processMarkdown'](output)
        );
        this.answer = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to get answer. Please try again.';
        this.loading = false;
      }
    });
  }

  // Guided tab prompt generation and ask
  generatePrompt() {
    this.warning = null;
    if (!this.companyName || !this.companyIsin || !this.question || !this.audience || !this.tone || !this.depth) {
      this.generatedPrompt = '';
      return;
    }
    // Validate Output Format
    const validFormats = ['Email', 'Social Post', 'Text Block'];
    let format = this.outputFormat;
    if (!validFormats.includes(format)) {
      this.warning = 'Invalid format selected; using Text Block.';
      format = 'Text Block';
    }
    let prompt = `For the company \"${this.companyName} (ISIN: ${this.companyIsin})\", I would like to ask the following question: \"${this.question}\". Please tailor the response for an audience of \"${this.audience}\"`;
    if (this.perspective && this.perspective.trim()) {
      prompt += `, with a focus on \"${this.perspective.trim()}\"`;
    }
    prompt += `, a tone of \"${this.tone}\", and a depth of \"${this.depth}\"`;
    if (this.includeNumericData) {
      prompt += ', and include numeric data (e.g., KPI values)';
    } else {
      prompt += ', and do not include numeric data (e.g., KPI values)';
    }
    prompt += `. Format the response as ${format}.`;
    if (!this.includePromptIntention) {
      prompt += ' Do not describe the prompt in the response.';
    }
    this.generatedPrompt = prompt;
  }

  askGuidedQuestion() {
    // Always generate the prompt before asking
    this.generatePrompt();
    if (!this.generatedPrompt.trim()) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    this.esgService.askQuestion(this.generatedPrompt).subscribe({
      next: (res: string) => {
        let output = res;
        try {
          const parsed = JSON.parse(res);
          if (parsed.output) output = parsed.output;
        } catch {}
        this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
          this.esgService['processMarkdown'](output)
        );
        this.answer = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to get answer. Please try again.';
        this.loading = false;
      }
    });
  }

  copyAnswer() {
    if (!this.answer) return;
    navigator.clipboard.writeText(this.answer)
      .then(() => {})
      .catch(() => {});
  }

  /**
   * Export the Guided Question and its answer to a Word document
   */
  async exportGuidedQuestionToWord(options?: ExportOptionsResult) {
    if (!this.companyName || !this.companyIsin || !this.generatedPrompt || !this.answer) {
      return;
    }
    let answerText = this.answer;
    try {
      const parsed = JSON.parse(this.answer);
      if (parsed.output) answerText = parsed.output;
    } catch {}
    const children: (Paragraph | Table)[] = [];
    children.push(new Paragraph({
      text: `${this.companyName} (ISIN: ${this.companyIsin})`,
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
        text: this.generatedPrompt,
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
        console.log('Fetching report data for export...');
        const rawCompanyData = this.esgService.getRawCompanyData();
        const reportData = await this.esgService.getReport(rawCompanyData).toPromise();
        console.log('Report data fetched, including in Word document.');
        const safeReportData = typeof reportData === 'string' ? reportData : '';
        const reportDocElements = this.wordExportService.markdownToDocxElements(safeReportData);
        children.push(...reportDocElements);
      } catch (e) {
        console.error('Failed to fetch report data for export:', e);
        children.push(new Paragraph({ text: 'Failed to load report data.' }));
      }
    }
    const fileName = options?.fileName || `${this.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Guided_Question.docx`;
    await this.wordExportService.exportWordDocument(children, fileName);
  }

  /**
   * Ask the guided question and export the result to a Word document
   */
  async askAndSaveGuidedQuestion() {
    // Always generate the prompt before asking
    this.generatePrompt();
    if (!this.generatedPrompt.trim()) return;
    // Show export options dialog first
    const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
      data: { companyName: this.companyName },
      width: '1000px',
      disableClose: true
    });
    const result: ExportOptionsResult = await dialogRef.afterClosed().toPromise();
    if (!result) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    this.esgService.askQuestion(this.generatedPrompt).subscribe({
      next: async (res: string) => {
        let output = res;
        try {
          const parsed = JSON.parse(res);
          if (parsed.output) output = parsed.output;
        } catch {}
        this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
          this.esgService['processMarkdown'](output)
        );
        this.answer = res;
        this.loading = false;
        // After answer is received, export to Word with options
        await this.exportGuidedQuestionToWord(result);
      },
      error: (err: any) => {
        this.error = 'Failed to get answer. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Ask the simple question and export the result to a Word document
   */
  async askAndSaveSimpleQuestion() {
    if (!this.simplePrompt.trim()) return;
    // Show export options dialog first
    const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
      data: { companyName: this.companyName },
      width: '1000px',
      disableClose: true
    });
    const result: ExportOptionsResult = await dialogRef.afterClosed().toPromise();
    if (!result) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    const prefix = `For  ${this.companyName} ISIN:${this.companyIsin}: `;
    const fullPrompt = prefix + this.simplePrompt.trim();
    this.esgService.askQuestion(fullPrompt).subscribe({
      next: async (res: string) => {
        let output = res;
        try {
          const parsed = JSON.parse(res);
          if (parsed.output) output = parsed.output;
        } catch {}
        this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
          this.esgService['processMarkdown'](output)
        );
        this.answer = res;
        this.loading = false;
        // After answer is received, export to Word with options
        await this.exportSimpleQuestionToWord(fullPrompt, res, result);
      },
      error: (err: any) => {
        this.error = 'Failed to get answer. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Export the Simple Question and its answer to a Word document
   */
  async exportSimpleQuestionToWord(prompt: string, answer: string, options?: ExportOptionsResult) {
    if (!this.companyName || !this.companyIsin || !prompt || !answer) {
      return;
    }
    let answerText = answer;
    try {
      const parsed = JSON.parse(answer);
      if (parsed.output) answerText = parsed.output;
    } catch {}
    const children: (Paragraph | Table)[] = [];
    children.push(new Paragraph({
      text: `${this.companyName} (ISIN: ${this.companyIsin})`,
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
        console.log('Fetching report data for export...');
        const rawCompanyData = this.esgService.getRawCompanyData();
        const reportData = await this.esgService.getReport(rawCompanyData).toPromise();
        console.log('Report data fetched, including in Word document.');
        const safeReportData = typeof reportData === 'string' ? reportData : '';
        const reportDocElements = this.wordExportService.markdownToDocxElements(safeReportData);
        children.push(...reportDocElements);
      } catch (e) {
        console.error('Failed to fetch report data for export:', e);
        children.push(new Paragraph({ text: 'Failed to load report data.' }));
      }
    }
    const fileName = options?.fileName || `${this.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Simple_Question.docx`;
    await this.wordExportService.exportWordDocument(children, fileName);
  }

  copyGeneratedPrompt() {
    if (!this.generatedPrompt) return;
    navigator.clipboard.writeText(this.generatedPrompt)
      .then(() => {})
      .catch(() => {});
  }

  async exportCurrentAnswer() {
    const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
      data: { companyName: this.companyName },
      width: '1000px', // Set dialog width to 1000px for no scroll bar
      disableClose: true
    });
    const result: ExportOptionsResult = await dialogRef.afterClosed().toPromise();
    if (!result) return;
    // Use the selectedTabIndex to determine which export logic to use
    if (this.selectedTabIndex === 0) {
      // Simple tab
      const prefix = `For  ${this.companyName} ISIN:${this.companyIsin}: `;
      const fullPrompt = prefix + this.simplePrompt.trim();
      await this.exportSimpleQuestionToWord(fullPrompt, this.answer, result);
    } else if (this.selectedTabIndex === 1) {
      // Guided tab
      await this.exportGuidedQuestionToWord(result);
    }
  }
}

// Helper: Convert basic Markdown to docx Paragraphs
function markdownToDocxParagraphs(markdown: string): Paragraph[] {
  const lines = markdown.split(/\r?\n/);
  return lines.map(line => {
    // Headers
    if (line.startsWith('### ')) {
      return new Paragraph({
        text: line.replace(/^### /, ''),
        heading: HeadingLevel.HEADING_3,
      });
    }
    if (line.startsWith('## ')) {
      return new Paragraph({
        text: line.replace(/^## /, ''),
        heading: HeadingLevel.HEADING_2,
      });
    }
    if (line.startsWith('# ')) {
      return new Paragraph({
        text: line.replace(/^# /, ''),
        heading: HeadingLevel.HEADING_1,
      });
    }
    // Bold and italics (very basic, no nested support)
    let runs: TextRun[] = [];
    let rest = line;
    // Bold
    const boldMatch = rest.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
      const [full, boldText] = boldMatch;
      const [before, after] = rest.split(full);
      if (before) runs.push(new TextRun(before));
      runs.push(new TextRun({ text: boldText, bold: true }));
      if (after) runs.push(new TextRun(after));
      return new Paragraph({ children: runs });
    }
    // Italics
    const italicMatch = rest.match(/\*(.*?)\*/);
    if (italicMatch) {
      const [full, italicText] = italicMatch;
      const [before, after] = rest.split(full);
      if (before) runs.push(new TextRun(before));
      runs.push(new TextRun({ text: italicText, italics: true }));
      if (after) runs.push(new TextRun(after));
      return new Paragraph({ children: runs });
    }
    return new Paragraph({ text: line });
  });
}

// Helper: Convert Markdown to docx Paragraphs and Tables
function markdownToDocxElements(markdown: string): (Paragraph | Table)[] {
  const lines = markdown.split(/\r?\n/);
  const elements: (Paragraph | Table)[] = [];
  let i = 0;
  while (i < lines.length) {
    // Detect table
    if (
      lines[i].trim().startsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].trim().match(/^\|[-| ]+\|$/)
    ) {
      // Parse table
      const tableLines = [];
      tableLines.push(lines[i++]); // header
      tableLines.push(lines[i++]); // separator
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i++]);
      }
      // Convert to docx Table (skip separator row, bold header)
      const rows = tableLines
        .filter((row, idx) => idx !== 1) // skip the separator row
        .map((row, idx) => {
          const cells = row
            .split('|')
            .slice(1, -1)
            .map(cell => {
              const text = cell.trim();
              // Bold for header row
              if (idx === 0) {
                return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] });
              }
              return new TableCell({ children: [new Paragraph(text)] });
            });
          return new TableRow({ children: cells });
        });
      elements.push(new Table({ rows }));
    } else {
      // Fallback to previous markdown-to-docx logic for non-table lines
      elements.push(...markdownToDocxParagraphs(lines[i]));
      i++;
    }
  }
  return elements;
} 