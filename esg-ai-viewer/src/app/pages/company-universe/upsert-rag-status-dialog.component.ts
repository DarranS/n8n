import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface UpsertRagStatusItem {
  isin: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

@Component({
  selector: 'app-upsert-rag-status-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 mat-dialog-title style="padding: 28px 36px 0 36px; box-sizing: border-box;">Upsert to RAG Status</h2>
    <div mat-dialog-content class="upsert-dialog-content">
      <table class="upsert-status-table">
        <thead>
          <tr>
            <th>ISIN</th>
            <th>Name</th>
            <th>Status</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items">
            <td>{{ item.isin }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span *ngIf="item.status === 'pending'">⏳ Pending</span>
              <span *ngIf="item.status === 'success'">✅ Success</span>
              <span *ngIf="item.status === 'error'">❌ Error</span>
            </td>
            <td style="max-width: 350px; word-break: break-all;">{{ item.error || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div mat-dialog-actions class="upsert-dialog-actions">
      <span style="flex: 1 1 auto;"></span>
      <button mat-raised-button color="accent" class="dialog-style-btn" (click)="retryFailed()" [disabled]="!hasFailed()">
        Retry Failed
      </button>
      <button mat-raised-button color="primary" class="dialog-style-btn" (click)="close()" [disabled]="isAnyPending()">
        Close
      </button>
    </div>
    <style>
      :host ::ng-deep .mat-dialog-container {
        max-width: 1100px !important;
        width: 90vw !important;
      }
      .upsert-dialog-content {
        padding: 0 36px 8px 36px;
        box-sizing: border-box;
        max-height: 60vh;
        overflow-y: auto;
      }
      .upsert-status-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
      }
      .upsert-status-table th, .upsert-status-table td {
        text-align: left;
        padding: 8px 12px;
        border-bottom: 1px solid #eee;
      }
      .upsert-status-table th {
        background: #f5f5f5;
        font-weight: 600;
        color: #333;
      }
      .upsert-status-table tr:last-child td {
        border-bottom: none;
      }
      .upsert-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding: 18px 36px 18px 36px;
        box-sizing: border-box;
      }
    </style>
  `
})
export class UpsertRagStatusDialogComponent {
  @Output() retry = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<UpsertRagStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: UpsertRagStatusItem[] }
  ) {}

  get items(): UpsertRagStatusItem[] {
    return this.data?.items ?? [];
  }

  isAnyPending(): boolean {
    return this.items.some(item => item.status === 'pending');
  }

  hasFailed(): boolean {
    return this.items.some(item => item.status === 'error');
  }

  retryFailed() {
    this.retry.emit();
  }

  close() {
    this.dialogRef.close();
  }
} 