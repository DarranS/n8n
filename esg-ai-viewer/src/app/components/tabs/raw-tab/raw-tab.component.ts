import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ESGData } from '../../../services/esg.service';

@Component({
  selector: 'app-raw-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raw-tab.component.html',
  styleUrl: './raw-tab.component.scss'
})
export class RawTabComponent {
  @Input() data: ESGData | null = null;

  get formattedData(): string {
    return this.data ? JSON.stringify(this.data, null, 2) : '';
  }
}
