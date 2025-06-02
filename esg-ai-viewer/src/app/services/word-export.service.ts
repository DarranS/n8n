import { Injectable } from '@angular/core';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell } from 'docx';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class WordExportService {
  // Helper: Convert basic Markdown to docx Paragraphs
  private markdownToDocxParagraphs(markdown: string): Paragraph[] {
    const lines = markdown.split(/\r?\n/);
    return lines.map(line => {
      // Headers
      if (line.startsWith('### ')) {
        return new Paragraph({
          text: line.replace(/^### /, ''),
          heading: HeadingLevel.HEADING_3,
        });
      }
      if (line.startsWith('## ')) {
        return new Paragraph({
          text: line.replace(/^## /, ''),
          heading: HeadingLevel.HEADING_2,
        });
      }
      if (line.startsWith('# ')) {
        return new Paragraph({
          text: line.replace(/^# /, ''),
          heading: HeadingLevel.HEADING_1,
        });
      }
      // Bold and italics (very basic, no nested support)
      let runs: TextRun[] = [];
      let rest = line;
      // Bold
      const boldMatch = rest.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const [full, boldText] = boldMatch;
        const [before, after] = rest.split(full);
        if (before) runs.push(new TextRun(before));
        runs.push(new TextRun({ text: boldText, bold: true }));
        if (after) runs.push(new TextRun(after));
        return new Paragraph({ children: runs });
      }
      // Italics
      const italicMatch = rest.match(/\*(.*?)\*/);
      if (italicMatch) {
        const [full, italicText] = italicMatch;
        const [before, after] = rest.split(full);
        if (before) runs.push(new TextRun(before));
        runs.push(new TextRun({ text: italicText, italics: true }));
        if (after) runs.push(new TextRun(after));
        return new Paragraph({ children: runs });
      }
      return new Paragraph({ text: line });
    });
  }

  // Helper: Convert Markdown to docx Paragraphs and Tables
  markdownToDocxElements(markdown: string): (Paragraph | Table)[] {
    const lines = markdown.split(/\r?\n/);
    const elements: (Paragraph | Table)[] = [];
    let i = 0;
    while (i < lines.length) {
      // Detect table
      if (
        lines[i].trim().startsWith('|') &&
        i + 1 < lines.length &&
        lines[i + 1].trim().match(/^\|[-| ]+\|$/)
      ) {
        // Parse table
        const tableLines = [];
        tableLines.push(lines[i++]); // header
        tableLines.push(lines[i++]); // separator
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i++]);
        }
        // Convert to docx Table (skip separator row, bold header)
        const rows = tableLines
          .filter((row, idx) => idx !== 1) // skip the separator row
          .map((row, idx) => {
            const cells = row
              .split('|')
              .slice(1, -1)
              .map(cell => {
                const text = cell.trim();
                // Bold for header row
                if (idx === 0) {
                  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] });
                }
                return new TableCell({ children: [new Paragraph(text)] });
              });
            return new TableRow({ children: cells });
          });
        elements.push(new Table({ rows }));
      } else {
        // Fallback to previous markdown-to-docx logic for non-table lines
        elements.push(...this.markdownToDocxParagraphs(lines[i]));
        i++;
      }
    }
    return elements;
  }

  async exportWordDocument(children: (Paragraph | Table)[], fileName: string) {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  /**
   * Converts markdown to HTML for display (used in ESG summary/report rendering)
   */
  public processMarkdown(response: string): string {
    let processed = response;
    processed = processed
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>')
      .replace(/^\s*-\s(.*$)/gm, '<li>$1</li>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[a-z])(.*)$/gm, '<p>$1</p>');
    return processed;
  }

  /**
   * Formats summary data (object or string) to HTML using markdown processing
   */
  public formatSummaryData(data: any): string {
    if (data.CompanyESGSummary) {
      return this.formatCompanyESGSummary(data.CompanyESGSummary);
    } else if (data.output) {
      return this.formatCompanyESGSummary(data.output);
    } else if (typeof data === 'string') {
      return data.replace(/\\n/g, '\n');
    } else {
      return JSON.stringify(data, null, 2).replace(/\\n/g, '\n');
    }
  }

  /**
   * Formats a company ESG summary (object or string) to HTML using markdown processing
   */
  public formatCompanyESGSummary(summary: any): string {
    if (typeof summary === 'string') {
      return this.processMarkdown(summary.replace(/\\n/g, '\n'));
    }
    const content = summary.content || summary.text || summary.data || summary.description || summary.output || summary;
    if (typeof content === 'string') {
      return this.processMarkdown(content.replace(/\\n/g, '\n'));
    }
    const stringContent = JSON.stringify(content, null, 2).replace(/\\n/g, '\n');
    return this.processMarkdown(stringContent);
  }

  /**
   * Formats report data (object or string) to HTML using markdown processing
   */
  public formatReportData(data: any): string {
    if (data.CompanyESGReport) {
      return this.formatCompanyESGReport(data.CompanyESGReport);
    } else if (data.Report) {
      return this.formatCompanyESGReport(data.Report);
    } else if (typeof data === 'string') {
      return data.replace(/\\n/g, '\n');
    } else {
      return JSON.stringify(data, null, 2).replace(/\\n/g, '\n');
    }
  }

  /**
   * Formats a company ESG report (object or string) to HTML using markdown processing
   */
  public formatCompanyESGReport(report: any): string {
    if (typeof report === 'string') {
      return report.replace(/\\n/g, '\n');
    }
    const content = report.content || report.text || report.data || report;
    if (typeof content === 'string') {
      return content.replace(/\\n/g, '\n');
    }
    return JSON.stringify(content, null, 2).replace(/\\n/g, '\n');
  }
} 