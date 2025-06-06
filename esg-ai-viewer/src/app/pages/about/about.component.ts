import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule, MarkdownService, SECURITY_CONTEXT } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { BuildInfoService } from '../../services/build-info.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [MarkdownModule, CommonModule],
  providers: [
    MarkdownService,
    { provide: SECURITY_CONTEXT, useValue: 0 }
  ]
})
export class AboutComponent implements OnInit {
  selectedTab: 'readme' | 'spec' = 'readme';
  docContent = '';
  isLoading: boolean = true;
  error: string = '';
  buildTag: string = 'Not available';
  environment: string = 'Development';

  constructor(
    private http: HttpClient,
    private markdownService: MarkdownService,
    private buildInfoService: BuildInfoService,
    private configService: ConfigService
  ) {
  }

  ngOnInit() {
    const config = this.configService.getConfig();
    this.buildTag = this.buildInfoService.getBuildTag();
    this.environment = this.buildInfoService.getEnvironment();
    this.loadDoc();
  }

  selectTab(tab: 'readme' | 'spec') {
    this.selectedTab = tab;
    this.loadDoc();
  }

  loadDoc() {
    const filePath = this.selectedTab === 'readme' ? 'assets/README.md' : 'assets/productspec.md';
    this.isLoading = true;
    this.error = '';
    
    this.http.get(filePath, { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.docContent = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading document:', err);
          this.error = 'Failed to load document. Please try again later.';
          this.isLoading = false;
        }
      });
  }
} 