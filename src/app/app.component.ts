import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'WhistOnline';
  headerVisibleComponents: string[] = ['/dashboard', '/profile', '/join-room', '/rules', '/leaderboard'];
  constructor(private router: Router) {
  } 
  
  isHeaderVisible(): boolean {
    return this.headerVisibleComponents.includes(this.router.url);
  }
}
