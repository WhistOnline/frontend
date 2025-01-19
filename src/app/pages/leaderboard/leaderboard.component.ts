import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  isLoading: boolean = false;
  players: User[] = [];
  constructor(private userService: UserService) { 
  }

  ngOnInit() {
    this.getAllPlayers();
  }
  getGamesPlayed(user: User): number {
    return user.wins + user.draws + user.losses;
  }

  getPlayerPoints(user: User): number {
    return user.wins * 3 + user.draws;
  }

  getPlayerName(): string {
    return this.userService.userInfo?.username || 'Guest';
  }

  getAllPlayers(): void {
    this.isLoading = true;
    this.userService.getLeaderboard().subscribe((players) => {
      this.players = players.sort((a, b) => this.getPlayerPoints(b) - this.getPlayerPoints(a));
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
    });
  }
}
