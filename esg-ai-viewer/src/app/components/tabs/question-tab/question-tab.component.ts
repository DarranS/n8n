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
    MatTabsModule
  ],
  templateUrl: './question-tab.component.html',
  styleUrls: ['./question-tab.component.scss']
})
export class QuestionTabComponent {
  @Input() companyName: string = '';
  @Input() companyIsin: string = '';

  // Tab state
  selectedTabIndex: number = 0;

  // Simple tab state
  simplePrompt: string = '';
  simpleGeneratedPrompt: string = '';

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

  constructor(private http: HttpClient, private esgService: EsgService, private sanitizer: DomSanitizer) {}

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
    if (!this.companyName || !this.companyIsin || !this.question || !this.audience || !this.tone || !this.depth) {
      this.generatedPrompt = '';
      return;
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
    prompt += '.';
    this.generatedPrompt = prompt;
  }

  askGuidedQuestion() {
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

  generateSimplePrompt() {
    if (!this.simplePrompt.trim()) {
      this.simpleGeneratedPrompt = '';
      return;
    }
    const prefix = `For the Company "${this.companyName} ISIN:${this.companyIsin}" I would like to ask the following question: `;
    this.simpleGeneratedPrompt = prefix + this.simplePrompt.trim();
  }
} 