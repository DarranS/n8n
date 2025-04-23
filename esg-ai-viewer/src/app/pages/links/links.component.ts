import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="links-container">
      <h2 class="links-title">Useful Links</h2>
      <table class="links-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><a href="https://n8n.sheltononline.com/" target="_blank"><strong>N8N</strong></a></td>
            <td>A powerful workflow automation platform that enables low-code/no-code integrations between various services and applications. N8N provides a visual interface for building complex workflows, handling data transformations, and automating business processes.</td>
          </tr>
          <tr>
            <td><a href="https://platform.openai.com/docs/overview" target="_blank"><strong>OpenAI API</strong></a></td>
            <td>The official API platform for OpenAI's suite of AI models, including GPT-4, GPT-3.5, and other advanced language models. Provides comprehensive documentation, API management tools, and resources for integrating AI capabilities into applications.</td>
          </tr>
          <tr>
            <td><a href="https://supabase.com/" target="_blank"><strong>Supabase</strong></a></td>
            <td>An open-source Firebase alternative that provides a complete backend solution, including a PostgreSQL database, authentication, real-time subscriptions, and vector storage capabilities. Particularly useful for building RAG (Retrieval-Augmented Generation) applications with its built-in vector similarity search.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .links-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }

    .links-title {
      margin: 0;
      padding: 1rem;
    }

    .links-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }

    .links-table th,
    .links-table td {
      padding: 1rem;
      border: 1px solid #ddd;
      text-align: left;
    }

    .links-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    .links-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .links-table a {
      color: #007bff;
      text-decoration: none;
    }

    .links-table a:hover {
      text-decoration: underline;
    }
  `]
})
export class LinksComponent {} 