// Declare window interface
declare global {
  interface Window {
    __BUILD_TAG__: string;
    __ENVIRONMENT__: string;
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BuildInfoService {
  private buildTag: string;
  private environment: string = 'Development';

  constructor() {
    this.buildTag = window.__BUILD_TAG__ || 'unknown';

    // Wait for window to be available and then initialize
    if (typeof window !== 'undefined') {
      this.initializeBuildInfo();
    } else {
      // In SSR context, wait for window
      setTimeout(() => this.initializeBuildInfo(), 0);
    }
  }

  private initializeBuildInfo(): void {
    try {
      // Get build info from window (set by env.js)
      const tag = window.__BUILD_TAG__;
      const env = window.__ENVIRONMENT__;

      if (tag) {
        this.buildTag = tag;
      }
      
      if (env) {
        this.environment = env;
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