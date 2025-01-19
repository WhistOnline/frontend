// src/app/header/header.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public currentComponent: string = '';
  constructor(private router: Router) {
    this.currentComponent = this.router.url;
  }
  isDashboardActive(): boolean {
    return this.router.url === '/dashboard';
  }

  isProfileActive(): boolean {
    return this.router.url === '/profile';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
