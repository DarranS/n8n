import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-simple-question-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <form class="simple-form" (ngSubmit)="onAsk()">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Prompt</mat-label>
        <textarea matInput [(ngModel)]="simplePrompt" name="simplePrompt" rows="4" required [readonly]="loading"></textarea>
      </mat-form-field>
      <div class="form-actions">
        <button mat-raised-button color="primary" type="button" (click)="onGeneratePrompt()" [disabled]="loading || !simplePrompt.trim()">
          {{ simpleGeneratedPrompt ? 'Hide Prompt' : 'Generate Prompt' }}
        </button>
        <button mat-raised-button color="accent" type="submit" [disabled]="loading || !simplePrompt.trim()">Ask</button>
        <button mat-raised-button color="accent" type="button" (click)="onAskAndSave()" [disabled]="loading || !simplePrompt.trim()">
          <mat-icon>description</mat-icon>
          Ask & Save
        </button>
      </div>
    </form>
    <div *ngIf="simpleGeneratedPrompt" class="generated-prompt">
      <b>Prompt:</b> {{ simpleGeneratedPrompt }}
      <button mat-icon-button (click)="onCopyPrompt()" [disabled]="!simpleGeneratedPrompt" matTooltip="Copy prompt" style="float:right; margin-top:-4px;">
        <mat-icon>content_copy</mat-icon>
      </button>
    </div>
  `,
  styleUrls: ['./simple-question-tab.component.scss']
})
export class SimpleQuestionTabComponent {
  @Input() companyName: string = '';
  @Input() companyIsin: string = '';
  @Input() loading: boolean = false;
  @Output() ask = new EventEmitter<string>();
  @Output() askAndSave = new EventEmitter<string>();
  @Output() generatePrompt = new EventEmitter<string>();

  simplePrompt: string = '';
  simpleGeneratedPrompt: string = '';

  onAsk() {
    this.ask.emit(this.simplePrompt);
  }

  onAskAndSave() {
    this.askAndSave.emit(this.simplePrompt);
  }

  onGeneratePrompt() {
    if (this.simpleGeneratedPrompt && this.simpleGeneratedPrompt.trim()) {
      this.simpleGeneratedPrompt = '';
      return;
    }
    if (!this.simplePrompt.trim()) {
      this.simpleGeneratedPrompt = '';
      return;
    }
    const prefix = `For  ${this.companyName} ISIN:${this.companyIsin}: `;
    this.simpleGeneratedPrompt = prefix + this.simplePrompt.trim();
    this.generatePrompt.emit(this.simpleGeneratedPrompt);
  }

  onCopyPrompt() {
    if (!this.simpleGeneratedPrompt) return;
    navigator.clipboard.writeText(this.simpleGeneratedPrompt)
      .then(() => {})
      .catch(() => {});
  }
} 