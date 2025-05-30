import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface ExportOptionsData {
  companyName: string;
  fileName?: string;
}

export interface ExportOptionsResult {
  includePrompt: boolean;
  includeAnswer: boolean;
  includeReportData: boolean;
  fileName: string;
}

@Component({
  selector: 'app-export-options-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatSlideToggleModule],
  template: `
    <h2 mat-dialog-title style="padding: 28px 36px 0 36px; box-sizing: border-box;">Export to Word Options</h2>
    <div mat-dialog-content style="display: flex; flex-direction: column; gap: 32px; padding: 0 36px 8px 36px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; gap: 22px; padding-bottom: 18px; border-bottom: 1px solid #eee;">
        <span style="font-weight: 500; color: #555; margin-bottom: 2px;">What to include:</span>
        <mat-slide-toggle style='margin-left: 12px;' [(ngModel)]="includePrompt">Include Prompt</mat-slide-toggle>
        <mat-slide-toggle style='margin-left: 12px;' [(ngModel)]="includeAnswer">Include Answer</mat-slide-toggle>
        <mat-slide-toggle style='margin-left: 12px;' [(ngModel)]="includeReportData">Include Report Data</mat-slide-toggle>
      </div>
      <div style="padding: 12px 0 0 0;">
        <span style="font-weight: 500; color: #555; margin-bottom: 2px; display: block;">File Name:</span>
        <mat-form-field appearance="outline" style="width: 100%; margin-top: 8px;">
          <mat-label>Export File Name</mat-label>
          <input matInput [(ngModel)]="fileName" />
        </mat-form-field>
      </div>
    </div>
    <div mat-dialog-actions style="display: flex; justify-content: flex-end; gap: 16px; padding: 18px 36px 18px 36px; box-sizing: border-box;">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onOk()" style="min-width: 90px;">OK</button>
    </div>
  `
})
export class ExportOptionsDialogComponent {
  includePrompt = false;
  includeAnswer = true;
  includeReportData = false;
  fileName: string;

  constructor(
    public dialogRef: MatDialogRef<ExportOptionsDialogComponent, ExportOptionsResult>,
    @Inject(MAT_DIALOG_DATA) public data: ExportOptionsData
  ) {
    this.fileName = data.fileName || this.sanitizeFileName(data.companyName) + '.docx';
  }

  sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '');
  }

  onOk() {
    this.dialogRef.close({
      includePrompt: this.includePrompt,
      includeAnswer: this.includeAnswer,
      includeReportData: this.includeReportData,
      fileName: this.fileName
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
} 