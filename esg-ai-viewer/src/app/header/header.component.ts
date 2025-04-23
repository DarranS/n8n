import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  title = 'ESG AI Viewer';
  currentUrl = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  isActive(route: string, exact: boolean = false): boolean {
    if (exact) {
      return this.currentUrl === route;
    }
    return this.currentUrl.startsWith(route);
  }

  isHomePage(): boolean {
    return this.currentUrl === '/' || this.currentUrl === '';
  }
}