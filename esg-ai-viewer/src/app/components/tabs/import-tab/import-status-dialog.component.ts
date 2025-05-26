import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface ImportStatusItem {
  isin: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

@Component({
  selector: 'app-import-status-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 mat-dialog-title>Import Status</h2>
    <div mat-dialog-content>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left;">ISIN</th>
            <th style="text-align: left;">Name</th>
            <th style="text-align: left;">Status</th>
            <th style="text-align: left;">Error</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data.items">
            <td>{{ item.isin }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span *ngIf="item.status === 'pending'">⏳ Pending</span>
              <span *ngIf="item.status === 'success'">✅ Success</span>
              <span *ngIf="item.status === 'error'">❌ Error</span>
            </td>
            <td>{{ item.error || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">Close</button>
    </div>
  `
})
export class ImportStatusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImportStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: ImportStatusItem[] }
  ) {}

  close() {
    this.dialogRef.close();
  }
} 