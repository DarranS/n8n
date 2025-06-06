import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EsgService } from '../../../services/esg.service';
import { ReportExportService } from '../../../services/report-export.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ExportOptionsDialogComponent, ExportOptionsResult } from './export-options-dialog.component';
import { GuidedQuestionTabComponent } from './guided-question-tab.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-multi-company-simple-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatTableModule,
    GuidedQuestionTabComponent,
    MatTabsModule
  ],
  templateUrl: './multi-company-simple-question-dialog.component.html',
  styleUrls: ['./multi-company-simple-question-dialog.component.scss']
})
export class MultiCompanySimpleQuestionDialogComponent {
  prompt: string = '';
  loading: boolean = false;
  error: string | null = null;
  generatedPrompt: string = '';
  results: { answer: string, error?: string }[] = [];
  showPromptPreview: boolean = false;
  statusMessage: string = '';
  // Guided tab state
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
  outputFormatOptions = [
    { value: 'Email', tooltip: "Structured with a formal salutation, body, and closing, suitable for professional correspondence." },
    { value: 'Social Post', tooltip: "Concise, engaging, and formatted for platforms like X, targeting under 280 characters. Summarize content if needed to fit." },
    { value: 'Text Block', tooltip: "A narrative paragraph or set of paragraphs suitable for inclusion in reports, presentations, or other documents." }
  ];
  warning: string | null = null;
  guidedPromptOutOfDate: boolean = false;
  includePromptIntention: boolean = false;
  includeNumericData: boolean = false;
  perspective: string = '';
  question: string = '';
  audience: string = 'Customer';
  tone: string = 'Professional';
  depth: string = 'Brief';
  outputFormat: string = 'Text Block';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { companies: { CompanyName: string, ISIN: string }[] },
    private dialogRef: MatDialogRef<MultiCompanySimpleQuestionDialogComponent>,
    private esgService: EsgService,
    private reportExportService: ReportExportService,
    private dialog: MatDialog
  ) {}

  togglePromptPreview() {
    if (this.showPromptPreview) {
      this.showPromptPreview = false;
      return;
    }
    // Always prepend the company placeholder prefix
    const prefix = 'For the company "{{COMPANY_NAME}} (ISIN: {{COMPANY_ISIN}})": ';
    this.generatedPrompt = this.prompt.trim().startsWith(prefix)
      ? this.prompt.trim()
      : prefix + this.prompt.trim();
    this.showPromptPreview = true;
  }

  async askAndSave() {
    if (!this.prompt.trim()) {
      this.error = 'Please enter a prompt.';
      return;
    }
    // Always prepend the company placeholder prefix
    const prefix = 'For the company "{{COMPANY_NAME}} (ISIN: {{COMPANY_ISIN}})": ';
    const batchPrompt = this.prompt.trim().startsWith(prefix)
      ? this.prompt.trim()
      : prefix + this.prompt.trim();
    // 1. Open export options dialog
    const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
      data: { companyName: '', fileName: getBatchDefaultFileName() },
      width: '1000px',
      disableClose: true
    });
    const result: ExportOptionsResult = await dialogRef.afterClosed().toPromise();
    if (!result) return;

    // 2. Bulk answer process using the existing method
    this.loading = true;
    this.error = null;
    this.statusMessage = '';
    try {
      await this.reportExportService.exportBatchGuidedQuestionsToWord({
        companies: this.data.companies,
        generatedPrompt: batchPrompt,
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
      this.dialogRef.close();
    } catch (e: any) {
      this.loading = false;
      this.statusMessage = '';
      this.error = e?.message || 'Error during batch export.';
    }
  }

  async exportResults() {
    // TODO: Implement export logic using reportExportService
    // Placeholder: show alert or log results
    // await this.reportExportService.exportSimpleBatchResults(this.results);
    alert('Export functionality not yet implemented.');
  }

  close() {
    this.dialogRef.close();
    this.showPromptPreview = false;
  }

  handleGuidedGeneratePrompt() {
    const prefix = 'For the company "{{COMPANY_NAME}} (ISIN: {{COMPANY_ISIN}})", ';
    let prompt = `${prefix}I would like to ask the following question: "${this.question}". Please tailor the response for an audience of "${this.audience}"`;
    if (this.perspective && this.perspective.trim()) {
      prompt += `, with a focus on "${this.perspective.trim()}"`;
    }
    prompt += `, a tone of "${this.tone}", and a depth of "${this.depth}"`;
    if (this.includeNumericData) {
      prompt += ', and include numeric data (e.g., KPI values)';
    } else {
      prompt += ', and do not include numeric data (e.g., KPI values)';
    }
    prompt += `. Format the response as ${this.outputFormat}.`;
    if (!this.includePromptIntention) {
      prompt += ' Do not describe the prompt in the response.';
    }
    this.generatedPrompt = prompt;
  }

  async handleGuidedAskAndSave() {
    this.handleGuidedGeneratePrompt();
    if (!this.generatedPrompt.trim()) return;
    const dialogRef = this.dialog.open(ExportOptionsDialogComponent, {
      data: { companyName: '', fileName: getBatchDefaultFileName() },
      width: '1000px',
      disableClose: true
    });
    const result: ExportOptionsResult = await dialogRef.afterClosed().toPromise();
    if (!result) return;

    this.loading = true;
    this.error = null;
    this.statusMessage = '';
    try {
      await this.reportExportService.exportBatchGuidedQuestionsToWord({
        companies: this.data.companies,
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
      this.dialogRef.close();
    } catch (e: any) {
      this.loading = false;
      this.statusMessage = '';
      this.error = e?.message || 'Error during batch export.';
    }
  }

  async handleGuidedAsk() {
    this.handleGuidedGeneratePrompt();
    if (!this.generatedPrompt.trim()) return;
    this.loading = true;
    this.error = null;
    this.statusMessage = '';
    try {
      await this.reportExportService.exportBatchGuidedQuestionsToWord({
        companies: this.data.companies,
        generatedPrompt: this.generatedPrompt,
        result: {}, // default options
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
      this.dialogRef.close();
    } catch (e: any) {
      this.loading = false;
      this.statusMessage = '';
      this.error = e?.message || 'Error during batch export.';
    }
  }

  handleGuidedCopyPrompt() {
    if (!this.generatedPrompt) return;
    navigator.clipboard.writeText(this.generatedPrompt)
      .then(() => {})
      .catch(() => {});
  }
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