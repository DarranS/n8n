// Declare window interface
declare global {
  interface Window {
    __BUILD_TAG__: string;
    __ENVIRONMENT__: string;
  }
}

import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BuildInfoService {
  private buildTag: string;
  private environment: string = 'Development';

  constructor(private configService: ConfigService) {
    this.buildTag = (window as any).__BUILD_TAG__ || 'unknown';
    this.initializeBuildInfo();
  }

  private initializeBuildInfo(): void {
    try {
      // Prefer configService environment if loaded
      const env = this.configService.environment;
      if (env && env !== 'Unknown') {
        this.environment = env;
      } else if (typeof window !== 'undefined') {
        const winEnv = (window as any).__ENVIRONMENT__;
        if (winEnv) {
          this.environment = winEnv;
        }
      }
    } catch (error) {
      console.error('Error initializing build info:', error);
    }
  }

  getBuildTag(): string {
    return this.buildTag;
  }

  getEnvironment(): string {
    return this.environment;
  }
} 