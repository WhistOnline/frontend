import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { joinRoomService } from './join-room.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GameSessionService } from '../game/services/game-session.service';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.scss',
})
export class JoinRoomComponent {
  roomCode: string = '';
  isError: boolean = false;
  errorMessage: string = 'Room does not exist';
  constructor(
    private joinService: joinRoomService,
    private router: Router,
    private gameSessionService: GameSessionService,
  ) {}

  ngOnInit() {}

  joinRoom(): void {
    this.joinService.joinRoom(this.roomCode).subscribe(
      () => {
        this.isError = false;
        this.gameSessionService.startGame(this.roomCode);
        this.router.navigate(['/waiting-room']);
      },
      (error: any) => {
        this.isError = true;
      },
    );
  }
}
