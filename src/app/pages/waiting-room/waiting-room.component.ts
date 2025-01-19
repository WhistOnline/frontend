import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameSessionService } from '../game/services/game-session.service';
import { Subscription, take, takeWhile } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  imports: [],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.scss',
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  public gameCode: string = '';

  private gameCodeSubscription!: Subscription;

  public constructor(
    private gameSessionService: GameSessionService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.gameCodeSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.gameCodeSubscription = this.gameSessionService.gameCode$.subscribe(
      (gameCode) => {
        this.gameCode = gameCode;
      },
    );
    this.gameSessionService.gameState$.pipe(take(1)).subscribe(() => {
      this.router.navigate(['game']);
    });
  }
}
