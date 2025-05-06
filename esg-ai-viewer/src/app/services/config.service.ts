import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  environment: string;
  auth: any;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    if (this.config) return;
    this.config = await firstValueFrom(this.http.get<AppConfig>('assets/config/config.json'));
  }

  getConfig(): AppConfig | null {
    return this.config;
  }

  get environment(): string {
    return this.config?.environment || 'Unknown';
  }
} 