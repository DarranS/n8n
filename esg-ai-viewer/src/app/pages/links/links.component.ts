import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="links-container">
      <h1>ESG Resources & Links</h1>
      <div class="content">
        <section>
          <h2>ESG Resources</h2>
          <div class="link-grid">
            <a href="https://www.msci.com/esg-ratings" target="_blank" class="link-card">
              <h3>MSCI ESG Ratings</h3>
              <p>Access comprehensive ESG ratings and research.</p>
            </a>
            <a href="https://www.sustainalytics.com/" target="_blank" class="link-card">
              <h3>Sustainalytics</h3>
              <p>Explore ESG risk ratings and research solutions.</p>
            </a>
            <a href="https://www.globalreporting.org/" target="_blank" class="link-card">
              <h3>Global Reporting Initiative</h3>
              <p>Learn about ESG reporting standards and guidelines.</p>
            </a>
            <a href="https://www.unpri.org/" target="_blank" class="link-card">
              <h3>UN PRI</h3>
              <p>Understand principles for responsible investment.</p>
            </a>
          </div>
        </section>

        <section>
          <h2>Regulatory Framework</h2>
          <div class="link-grid">
            <a href="https://ec.europa.eu/info/business-economy-euro/banking-and-finance/sustainable-finance_en" target="_blank" class="link-card">
              <h3>EU Sustainable Finance</h3>
              <p>Access EU regulations and guidelines on sustainable finance.</p>
            </a>
            <a href="https://www.sec.gov/news/press-release/2022-46" target="_blank" class="link-card">
              <h3>SEC Climate Disclosure</h3>
              <p>Learn about proposed climate disclosure rules.</p>
            </a>
          </div>
        </section>

        <section>
          <h2>ESG Data & Analytics</h2>
          <div class="link-grid">
            <a href="https://www.refinitiv.com/en/sustainable-finance/esg-investing" target="_blank" class="link-card">
              <h3>Refinitiv ESG Data</h3>
              <p>Comprehensive ESG data and scoring solutions.</p>
            </a>
            <a href="https://www.spglobal.com/esg/" target="_blank" class="link-card">
              <h3>S&P Global ESG</h3>
              <p>ESG indices, ratings, and analytics.</p>
            </a>
            <a href="https://www.bloomberg.com/professional/solution/sustainable-finance/" target="_blank" class="link-card">
              <h3>Bloomberg ESG Data</h3>
              <p>ESG data integration and analytics platform.</p>
            </a>
          </div>
        </section>

        <section>
          <h2>Industry Standards</h2>
          <div class="link-grid">
            <a href="https://www.sasb.org/" target="_blank" class="link-card">
              <h3>SASB Standards</h3>
              <p>Industry-specific sustainability accounting standards.</p>
            </a>
            <a href="https://www.cdp.net/" target="_blank" class="link-card">
              <h3>CDP</h3>
              <p>Global environmental disclosure system.</p>
            </a>
            <a href="https://www.tcfdhub.org/" target="_blank" class="link-card">
              <h3>TCFD Knowledge Hub</h3>
              <p>Climate-related financial disclosure resources.</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .links-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;

      h1 {
        color: #1976d2;
        margin-bottom: 2rem;
        text-align: center;
      }

      .content {
        section {
          margin-bottom: 3rem;

          h2 {
            color: #333;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
          }

          .link-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;

            .link-card {
              background-color: #fff;
              border-radius: 8px;
              padding: 1.5rem;
              text-decoration: none;
              color: inherit;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s ease, box-shadow 0.2s ease;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
              }

              h3 {
                color: #1976d2;
                margin: 0 0 0.5rem 0;
                font-size: 1.2rem;
              }

              p {
                color: #666;
                margin: 0;
                line-height: 1.4;
              }
            }
          }
        }
      }

      @media (max-width: 768px) {
        padding: 1rem;

        .link-grid {
          grid-template-columns: 1fr !important;
        }
      }
    }
  `]
})
export class LinksComponent {} 