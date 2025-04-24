import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-raw-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './raw-tab.component.html',
  styleUrl: './raw-tab.component.scss'
})
export class RawTabComponent {
  @Input() data: any = null;

  get formattedData(): string {
    return this.data ? JSON.stringify(this.data, null, 2) : '';
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.formattedData)
      .then(() => {
        // You could add a toast notification here if you want
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  }
}
