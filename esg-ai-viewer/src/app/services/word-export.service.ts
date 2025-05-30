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
} 