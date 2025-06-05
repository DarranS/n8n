import { Component, Input, Inject, OnInit, Optional, ElementRef, ViewChild } from '@angular/core';
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
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportOptionsDialogComponent, ExportOptionsResult } from './export-options-dialog.component';
import { WordExportService } from '../../../services/word-export.service';
import { ReportExportService } from '../../../services/report-export.service';

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
export class QuestionTabComponent implements OnInit {
  @Input() companyName: string = '';
  @Input() companyIsin: string = '';
  @Input() companies: { CompanyName: string, ISIN: string }[] = [];

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
  simpleGeneratedPrompt: string = '';

  // Guided tab state
  answer: string = '';
  loading = false;
  error: string | null = null;
  public formattedAnswer: SafeHtml = '';

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

  statusMessage: string = '';

  @ViewChild('containerRef') containerRef!: ElementRef;

  // Add a flag to track if the guided prompt is out of date
  guidedPromptOutOfDate: boolean = false;

  generatedPrompt: string = '';

  outputFormatOptions = [
    { value: 'Email', tooltip: "Structured with a formal salutation, body, and closing, suitable for professional correspondence." },
    { value: 'Social Post', tooltip: "Concise, engaging, and formatted for platforms like X, targeting under 280 characters. Summarize content if needed to fit." },
    { value: 'Text Block', tooltip: "A narrative paragraph or set of paragraphs suitable for inclusion in reports, presentations, or other documents." }
  ];

  constructor(
    private http: HttpClient,
    private esgService: EsgService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private wordExportService: WordExportService,
    private reportExportService: ReportExportService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any = null,
    @Optional() public dialogRef: MatDialogRef<QuestionTabComponent> | null = null
  ) {
    if (data && data.companies) {
      this.companies = data.companies;
      if (this.companies.length === 1) {
        this.companyName = this.companies[0].CompanyName;
        this.companyIsin = this.companies[0].ISIN;
      }
    }
  }

  get isMultiCompany() {
    return this.companies && this.companies.length > 1;
  }

  // Simple tab ask
  async askSimpleQuestion() {
    this.generateSimplePrompt();
    if (!this.simplePrompt.trim()) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    const prefix = `For  ${this.companyName} ISIN:${this.companyIsin}: `;
    const fullPrompt = prefix + this.simplePrompt.trim();
    this.statusMessage = '';
    try {
      let result = '';
      const maxRetries = 3;
      const delays = [20000, 40000, 60000];
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            this.statusMessage = `Retrying... Attempt ${attempt + 1} of ${maxRetries}`;
          }
          result = (await this.esgService.askQuestion(fullPrompt).toPromise()) ?? "";
          break;
        } catch (e) {
          if (attempt === maxRetries - 1) throw e;
          this.statusMessage = `Retrying... Attempt ${attempt + 2} of ${maxRetries}`;
          await new Promise(res => setTimeout(res, delays[attempt] || delays[delays.length - 1]));
        }
      }
      let output = result;
      try {
        const parsed = JSON.parse(result || "");
        if (parsed.output) output = parsed.output;
      } catch {}
      this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
        this.wordExportService.processMarkdown(output)
      );
      this.answer = result;
      this.loading = false;
      this.statusMessage = '';
    } catch (err) {
      this.error = 'Failed to get answer. Please try again.';
      this.loading = false;
      this.statusMessage = '';
    }
  }

  // Guided tab prompt generation and ask
  generatePrompt() {
    this.warning = null;
    this.guidedPromptOutOfDate = false;
    // Toggle off if already displayed
    if (this.generatedPrompt && this.generatedPrompt.trim()) {
      this.generatedPrompt = '';
      return;
    }
    if (this.isMultiCompany) {
      if (!this.question || !this.audience || !this.tone || !this.depth) {
        this.generatedPrompt = '';
        return;
      }
      // Use placeholders for multi-company
      const validFormats = ['Email', 'Social Post', 'Text Block'];
      let format = this.outputFormat;
      if (!validFormats.includes(format)) {
        this.warning = 'Invalid format selected; using Text Block.';
        format = 'Text Block';
      }
      let prompt = `For the company \"{{COMPANY_NAME}} (ISIN: {{COMPANY_ISIN}})\", I would like to ask the following question: \"${this.question}\". Please tailor the response for an audience of \"${this.audience}\"`;
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
      return;
    }
    // Single company mode
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

  async askGuidedQuestion() {
    this.generatePrompt();
    if (!this.generatedPrompt.trim()) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    this.statusMessage = '';
    try {
      let result = '';
      const maxRetries = 3;
      const delays = [20000, 40000, 60000];
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            this.statusMessage = `Retrying... Attempt ${attempt + 1} of ${maxRetries}`;
          }
          result = (await this.esgService.askQuestion(this.generatedPrompt).toPromise()) ?? "";
          break;
        } catch (e) {
          if (attempt === maxRetries - 1) throw e;
          this.statusMessage = `Retrying... Attempt ${attempt + 2} of ${maxRetries}`;
          await new Promise(res => setTimeout(res, delays[attempt] || delays[delays.length - 1]));
        }
      }
      let output = result;
      try {
        const parsed = JSON.parse(result || "");
        if (parsed.output) output = parsed.output;
      } catch {}
      this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
        this.wordExportService.processMarkdown(output)
      );
      this.answer = result;
      this.loading = false;
      this.guidedPromptOutOfDate = false;
      this.warning = null;
      this.statusMessage = '';
      setTimeout(() => {
        if (this.containerRef) {
          this.containerRef.nativeElement.scrollTo({ top: this.containerRef.nativeElement.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      this.error = 'Failed to get answer. Please try again.';
      this.loading = false;
      this.statusMessage = '';
    }
  }

  copyAnswer() {
    if (!this.answer) return;
    navigator.clipboard.writeText(this.answer)
      .then(() => {})
      .catch(() => {});
  }

  copyGeneratedPrompt() {
    if (!this.generatedPrompt) return;
    navigator.clipboard.writeText(this.generatedPrompt)
      .then(() => {})
      .catch(() => {});
  }

  async askAndSaveGuidedQuestion() {
    this.generatePrompt();
    if (!this.generatedPrompt.trim()) return;
    const defaultFileName = this.isMultiCompany ? getBatchDefaultFileName() : '';
    const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
      data: { companyName: this.isMultiCompany ? '' : this.companyName, fileName: defaultFileName },
      width: '1000px',
      disableClose: true
    });
    const result: ExportOptionsResult = await dialogRef.afterClosed().toPromise();
    if (!result) return;
    if (this.isMultiCompany) {
      this.loading = true;
      this.error = null;
      this.statusMessage = '';
      try {
        await this.reportExportService.exportBatchGuidedQuestionsToWord({
          companies: this.companies,
          generatedPrompt: this.generatedPrompt,
          result,
          askQuestion: async (prompt: string, idx: number, total: number) => {
            this.statusMessage = `Processing Company ${idx + 1} of ${total}...`;
            return await this.esgService.retryAskQuestion(prompt) ?? "";
          },
          onStatus: (msg: string) => {
            this.statusMessage = msg;
          }
        });
        this.loading = false;
        this.statusMessage = '';
        this.dialogRef?.close();
      } catch (e: any) {
        this.loading = false;
        this.statusMessage = '';
        this.error = e?.message || 'Error during batch export.';
      }
      return;
    }
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    this.esgService.askQuestion(this.generatedPrompt).subscribe({
      next: async (res: string) => {
        let output = res;
        try {
          const parsed = JSON.parse(res || "");
          if (parsed.output) output = parsed.output;
        } catch {}
        this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
          this.wordExportService.processMarkdown(output)
        );
        this.answer = res;
        this.loading = false;
        setTimeout(() => {
          if (this.containerRef) {
            this.containerRef.nativeElement.scrollTo({ top: this.containerRef.nativeElement.scrollHeight, behavior: 'smooth' });
          }
        }, 100);
        // After answer is received, export to Word with options using the new service
        try {
          await this.reportExportService.exportGuidedQuestionToWord({
            companyName: this.companyName,
            companyIsin: this.companyIsin,
            generatedPrompt: this.generatedPrompt,
            answer: res,
            options: result,
            rawCompanyData: this.esgService.getRawCompanyData(),
          });
        } catch (e: any) {
          this.error = e?.message || 'Error during report export.';
        }
      },
      error: (err: any) => {
        this.error = 'Failed to get answer. Please try again.';
        this.loading = false;
      }
    });
  }

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
          const parsed = JSON.parse(res || "");
          if (parsed.output) output = parsed.output;
        } catch {}
        this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(
          this.wordExportService.processMarkdown(output)
        );
        this.answer = res;
        this.loading = false;
        // After answer is received, export to Word with options using the new service
        try {
          await this.reportExportService.exportSimpleQuestionToWord({
            companyName: this.companyName,
            companyIsin: this.companyIsin,
            prompt: fullPrompt,
            answer: res,
            options: result,
            rawCompanyData: this.esgService.getRawCompanyData(),
          });
        } catch (e: any) {
          this.error = e?.message || 'Error during report export.';
        }
      },
      error: (err: any) => {
        this.error = 'Failed to get answer. Please try again.';
        this.loading = false;
      }
    });
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
      try {
        await this.reportExportService.exportSimpleQuestionToWord({
          companyName: this.companyName,
          companyIsin: this.companyIsin,
          prompt: fullPrompt,
          answer: this.answer,
          options: result,
          rawCompanyData: this.esgService.getRawCompanyData(),
        });
      } catch (e: any) {
        this.error = e?.message || 'Error during report export.';
      }
    } else if (this.selectedTabIndex === 1) {
      // Guided tab
      try {
        await this.reportExportService.exportGuidedQuestionToWord({
          companyName: this.companyName,
          companyIsin: this.companyIsin,
          generatedPrompt: this.generatedPrompt,
          answer: this.answer,
          options: result,
          rawCompanyData: this.esgService.getRawCompanyData(),
        });
      } catch (e: any) {
        this.error = e?.message || 'Error during report export.';
      }
    }
  }

  generateSimplePrompt() {
    if (this.simpleGeneratedPrompt && this.simpleGeneratedPrompt.trim()) {
      this.simpleGeneratedPrompt = '';
      return;
    }
    if (!this.simplePrompt.trim()) {
      this.simpleGeneratedPrompt = '';
      return;
    }
    // For Simple tab, just use the prompt as is (or you can add prefix if needed)
    const prefix = `For  ${this.companyName} ISIN:${this.companyIsin}: `;
    this.simpleGeneratedPrompt = prefix + this.simplePrompt.trim();
  }

  copySimpleGeneratedPrompt() {
    if (!this.simpleGeneratedPrompt) return;
    navigator.clipboard.writeText(this.simpleGeneratedPrompt)
      .then(() => {})
      .catch(() => {});
  }

  get answerWordCount(): number {
    if (!this.answer) return 0;
    // Remove HTML tags if any, then split by whitespace
    const text = this.answer.replace(/<[^>]*>/g, ' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // Helper to mark prompt as out of date if any guided field changes
  markGuidedPromptOutOfDate() {
    if (this.generatedPrompt) {
      this.guidedPromptOutOfDate = true;
      this.warning = 'Prompt/Answer may be out of date. Please regenerate the prompt.';
    }
  }

  // Add setters for guided fields to mark as out of date
  set question(value: string) {
    this._question = value;
    this.markGuidedPromptOutOfDate();
  }
  get question(): string {
    return this._question;
  }
  private _question: string = '';

  set audience(value: string) {
    this._audience = value;
    this.markGuidedPromptOutOfDate();
  }
  get audience(): string {
    return this._audience;
  }
  private _audience: string = 'Customer';

  set tone(value: string) {
    this._tone = value;
    this.markGuidedPromptOutOfDate();
  }
  get tone(): string {
    return this._tone;
  }
  private _tone: string = 'Professional';

  set depth(value: string) {
    this._depth = value;
    this.markGuidedPromptOutOfDate();
  }
  get depth(): string {
    return this._depth;
  }
  private _depth: string = 'Brief';

  set perspective(value: string) {
    this._perspective = value;
    this.markGuidedPromptOutOfDate();
  }
  get perspective(): string {
    return this._perspective;
  }
  private _perspective: string = '';

  set includeNumericData(value: boolean) {
    this._includeNumericData = value;
    this.markGuidedPromptOutOfDate();
  }
  get includeNumericData(): boolean {
    return this._includeNumericData;
  }
  private _includeNumericData: boolean = false;

  set outputFormat(value: string) {
    this._outputFormat = value;
    this.markGuidedPromptOutOfDate();
  }
  get outputFormat(): string {
    return this._outputFormat;
  }
  private _outputFormat: string = 'Text Block';

  set includePromptIntention(value: boolean) {
    this._includePromptIntention = value;
    this.markGuidedPromptOutOfDate();
  }
  get includePromptIntention(): boolean {
    return this._includePromptIntention;
  }
  private _includePromptIntention: boolean = false;

  ngOnInit(): void {}
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

function getBatchDefaultFileName() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = pad(now.getDate());
  const mmm = months[now.getMonth()];
  const yyyy = now.getFullYear();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  return `ESGAIViewer_${dd}${mmm}${yyyy}${hh}${mm}.docx`;
}

export { MultiCompanySimpleQuestionDialogComponent } from './multi-company-simple-question-dialog.component'; 