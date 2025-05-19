import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule
  ],
  templateUrl: './question-tab.component.html',
  styleUrls: ['./question-tab.component.scss']
})
export class QuestionTabComponent {
  @Input() companyName: string = '';
  userPrompt: string = '';
  answer: string = '';
  loading = false;
  error: string | null = null;
  public formattedAnswer: SafeHtml = '';

  get prefix(): string {
    return `For the \"${this.companyName || 'Selected Company'}\" I would like to ask the following. `;
  }

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    // Only allow editing after the prefix
    if (value.startsWith(this.prefix)) {
      this.userPrompt = value.slice(this.prefix.length);
    } else {
      // Prevent editing the prefix
      (event.target as HTMLTextAreaElement).value = this.prefix + this.userPrompt;
    }
  }

  constructor(private http: HttpClient, private esgService: EsgService, private sanitizer: DomSanitizer) {}

  askQuestion() {
    if (!this.userPrompt.trim()) return;
    this.loading = true;
    this.error = null;
    this.answer = '';
    this.formattedAnswer = '';
    const fullPrompt = this.prefix + this.userPrompt.trim();
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

  copyAnswer() {
    if (!this.answer) return;
    navigator.clipboard.writeText(this.answer)
      .then(() => {})
      .catch(() => {});
  }
} 