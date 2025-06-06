import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-guided-question-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="question-form">
      <div class="form-content">
        <!-- Audience -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Select the audience for the answer">info</mat-icon>
            Audience
          </label>
          <div class="form-field">
            <mat-form-field appearance="outline">
              <mat-label>Select Audience</mat-label>
              <mat-select [(ngModel)]="audience" name="audience" required (ngModelChange)="audienceChange.emit($event)">
                <mat-option *ngFor="let option of audienceOptions" [value]="option.value" [matTooltip]="option.tooltip">
                  {{ option.value }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        <!-- Tone -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Select the tone for the answer">info</mat-icon>
            Tone
          </label>
          <div class="form-field">
            <mat-radio-group [(ngModel)]="tone" name="tone" class="radio-group" required (ngModelChange)="toneChange.emit($event)">
              <mat-radio-button *ngFor="let option of toneOptions" [value]="option.value" matTooltip="{{ option.tooltip }}">
                {{ option.value }}
              </mat-radio-button>
            </mat-radio-group>
          </div>
        </div>
        <!-- Depth -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Select the depth of the answer">info</mat-icon>
            Depth
          </label>
          <div class="form-field">
            <mat-radio-group [(ngModel)]="depth" name="depth" class="radio-group" required (ngModelChange)="depthChange.emit($event)">
              <mat-radio-button *ngFor="let option of depthOptions" [value]="option.value" matTooltip="{{ option.tooltip }}">
                {{ option.value }}
              </mat-radio-button>
            </mat-radio-group>
          </div>
        </div>
        <!-- Output Format -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Select the output format">info</mat-icon>
            Output Format
          </label>
          <div class="form-field">
            <mat-radio-group [(ngModel)]="outputFormat" name="outputFormat" class="radio-group" required (ngModelChange)="outputFormatChange.emit($event)">
              <mat-radio-button *ngFor="let option of outputFormatOptions" [value]="option.value" matTooltip="{{ option.tooltip }}">
                {{ option.value }}
              </mat-radio-button>
            </mat-radio-group>
          </div>
        </div>
        <!-- Include Prompt Intention -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Include prompt intention in the answer">info</mat-icon>
            Include Prompt Intention
          </label>
          <div class="form-field">
            <mat-slide-toggle [(ngModel)]="includePromptIntention" name="includePromptIntention" color="primary" [disabled]="loading" [checked]="includePromptIntention" (ngModelChange)="includePromptIntentionChange.emit($event)">
              {{ includePromptIntention ? 'Yes' : 'No' }}
            </mat-slide-toggle>
          </div>
        </div>
        <!-- Include Numeric Data -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Include numeric data in the answer">info</mat-icon>
            Include Numeric Data
          </label>
          <div class="form-field">
            <mat-slide-toggle [(ngModel)]="includeNumericData" name="includeNumericData" color="primary" [disabled]="loading" (ngModelChange)="includeNumericDataChange.emit($event)">
              Yes
            </mat-slide-toggle>
          </div>
        </div>
        <!-- Perspective/Focus -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Add a perspective or focus (optional)">info</mat-icon>
            Perspective/Focus
          </label>
          <div class="form-field">
            <mat-form-field appearance="outline" class="perspective-field">
              <mat-label><span class="optional-label">(Optional)</span></mat-label>
              <input matInput [(ngModel)]="perspective" name="perspective" [readonly]="loading" (ngModelChange)="perspectiveChange.emit($event)" />
            </mat-form-field>
          </div>
        </div>
        <!-- Question -->
        <div class="form-row">
          <label class="form-label">
            <mat-icon matTooltip="Enter your question">info</mat-icon>
            Question
          </label>
          <div class="form-field">
            <mat-form-field appearance="outline" class="question-field">
              <input matInput [(ngModel)]="question" name="question" required [readonly]="loading" placeholder="Enter your question" (ngModelChange)="questionChange.emit($event)" />
            </mat-form-field>
          </div>
        </div>
        <!-- Actions -->
        <div class="form-actions">
          <button mat-raised-button color="primary" type="button" (click)="onGeneratePrompt()" [disabled]="loading || !question || !audience || !tone || !depth">
            {{ generatedPrompt ? 'Hide Prompt' : 'Generate Prompt' }}
          </button>
          <button *ngIf="!isMultiCompany" mat-raised-button color="accent" type="button" (click)="onAsk()" [disabled]="loading || !question || !audience || !tone || !depth">
            Ask
          </button>
          <button mat-raised-button color="accent" type="button" (click)="onAskAndSave()" [disabled]="loading || !question || !audience || !tone || !depth">
            <mat-icon>description</mat-icon>
            Ask & Save
          </button>
        </div>
      </div>
      <div *ngIf="generatedPrompt" class="generated-prompt">
        <b>Generated Prompt:</b> {{ generatedPrompt }}
        <button mat-icon-button (click)="onCopyPrompt()" [disabled]="!generatedPrompt" matTooltip="Copy prompt" style="float:right; margin-top:-4px;">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
      <div *ngIf="guidedPromptOutOfDate && generatedPrompt" class="error-container">
        <mat-icon color="warn">warning</mat-icon>
        <span>{{ warning }}</span>
      </div>
      <div *ngIf="answer" class="answer-container">
        <span class="answer-label">Answer:</span>
        <div>{{ answer }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./guided-question-tab.component.scss']
})
export class GuidedQuestionTabComponent {
  @Input() companyName: string = '';
  @Input() companyIsin: string = '';
  @Input() loading: boolean = false;
  @Input() audienceOptions: any[] = [];
  @Input() toneOptions: any[] = [];
  @Input() depthOptions: any[] = [];
  @Input() outputFormatOptions: any[] = [];
  @Input() warning: string | null = null;
  @Input() guidedPromptOutOfDate: boolean = false;
  @Input() generatedPrompt: string = '';
  @Input() includePromptIntention: boolean = false;
  @Input() includeNumericData: boolean = false;
  @Input() perspective: string = '';
  @Input() question: string = '';
  @Input() audience: string = '';
  @Input() tone: string = '';
  @Input() depth: string = '';
  @Input() outputFormat: string = '';
  @Input() answer: string = '';
  @Input() isMultiCompany: boolean = false;

  @Output() ask = new EventEmitter<void>();
  @Output() askAndSave = new EventEmitter<void>();
  @Output() generatePrompt = new EventEmitter<void>();
  @Output() copyPrompt = new EventEmitter<void>();
  @Output() questionChange = new EventEmitter<string>();
  @Output() audienceChange = new EventEmitter<string>();
  @Output() toneChange = new EventEmitter<string>();
  @Output() depthChange = new EventEmitter<string>();
  @Output() outputFormatChange = new EventEmitter<string>();
  @Output() perspectiveChange = new EventEmitter<string>();
  @Output() includeNumericDataChange = new EventEmitter<boolean>();
  @Output() includePromptIntentionChange = new EventEmitter<boolean>();

  onAsk() { this.ask.emit(); }
  onAskAndSave() { this.askAndSave.emit(); }
  onGeneratePrompt() { this.generatePrompt.emit(); }
  onCopyPrompt() { this.copyPrompt.emit(); }
} 