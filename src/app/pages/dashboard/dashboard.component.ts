import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { joinRoomService } from '../join-room/join-room.service';
import { GameSessionService } from '../game/services/game-session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  isCreatingRoom: boolean = false;
  router: Router = inject(Router);
  snackBar: MatSnackBar = inject(MatSnackBar);

  constructor(
    private roomService: joinRoomService,
    private gameSessionService: GameSessionService,
  ) {}
  ngOnInit() {}

  createRoom(): void {
    this.isCreatingRoom = true;
    // navigate towards the game page only if the room is created successfully
    this.roomService.createRoom().subscribe(
      (gameSession) => {
        this.isCreatingRoom = false;
        this.gameSessionService.startGame(gameSession.gameCode);
        this.router.navigate(['/waiting-room']);
      },
      (error) => {
        this.isCreatingRoom = false;
        this.snackBar.open(
          'There was an error with the room creation. Please try again later',
          'Close',
          {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: 'snackbar-green',
          },
        );
      },
    );
  }
  joinRoom(): void {
    this.router.navigate(['/join-room']);
  }

  viewRules(): void {
    this.router.navigate(['/rules']);
  }

  myProfile(): void {
    this.router.navigate(['/profile']);
  }

  leaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
