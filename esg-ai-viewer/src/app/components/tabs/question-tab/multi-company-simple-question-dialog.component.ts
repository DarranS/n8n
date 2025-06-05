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
    MatTableModule
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