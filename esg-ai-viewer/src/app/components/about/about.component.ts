import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <h1>About ESG AI Viewer</h1>
      <div class="content">
        <section>
          <h2>Overview</h2>
          <p>
            ESG AI Viewer is a powerful tool designed to analyze and visualize Environmental, Social, and Governance (ESG) 
            data for companies. Our platform leverages artificial intelligence to provide meaningful insights into 
            corporate sustainability and responsibility.
          </p>
        </section>

        <section>
          <h2>Features</h2>
          <ul>
            <li>Real-time ESG data analysis</li>
            <li>AI-powered insights and recommendations</li>
            <li>Interactive data visualization</li>
            <li>Comprehensive company reports</li>
            <li>Custom data filtering and sorting</li>
          </ul>
        </section>

        <section>
          <h2>How It Works</h2>
          <p>
            Our platform collects and processes ESG data from various reliable sources, applying advanced AI algorithms 
            to extract meaningful patterns and insights. Users can easily search for companies, view detailed reports, 
            and analyze trends in corporate sustainability practices.
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;

      h1 {
        color: #1976d2;
        margin-bottom: 2rem;
        text-align: center;
      }

      .content {
        section {
          margin-bottom: 2rem;

          h2 {
            color: #333;
            margin-bottom: 1rem;
          }

          p {
            color: #666;
            line-height: 1.6;
          }

          ul {
            list-style-type: none;
            padding: 0;

            li {
              color: #666;
              margin-bottom: 0.5rem;
              padding-left: 1.5rem;
              position: relative;

              &:before {
                content: "•";
                color: #1976d2;
                position: absolute;
                left: 0;
              }
            }
          }
        }
      }
    }
  `]
})
export class AboutComponent {} 