import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme) {
      this.setDarkTheme(savedTheme === 'true');
    } else {
      // Check if user prefers dark mode at OS level
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.setDarkTheme(prefersDark.matches);
      
      // Listen for changes in system theme preference
      prefersDark.addEventListener('change', (e) => {
        this.setDarkTheme(e.matches);
      });
    }
  }

  setDarkTheme(isDark: boolean) {
    this.isDarkTheme.next(isDark);
    localStorage.setItem('darkTheme', isDark.toString());
    
    // Update body classes
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
  }

  toggleTheme() {
    this.setDarkTheme(!this.isDarkTheme.value);
  }
} 