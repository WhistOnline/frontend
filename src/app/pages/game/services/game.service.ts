import { Injectable } from '@angular/core';
import { PlayerInfo } from '../interfaces/player-info.interface';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  take,
  interval,
} from 'rxjs';
import { Card, GameState } from '../game.types';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly playersListSubject: BehaviorSubject<PlayerInfo[]> =
    new BehaviorSubject<PlayerInfo[]>([
      {
        id: '1',
        name: 'Player 1',
        isTurn: true,
      },
      {
        id: '2',
        name: 'Player 2',
        isTurn: false,
      },
      {
        id: '3',
        name: 'Player 3',
        isTurn: false,
      },
      {
        id: '4',
        name: 'Myself',
        isTurn: false,
      },
    ]);

  private readonly currentPlayerIdSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('4');

  private readonly playersList$: Observable<PlayerInfo[]> =
    this.playersListSubject.asObservable();
  private readonly currentPlayerId$: Observable<string> =
    this.currentPlayerIdSubject.asObservable();

  private readonly gameState$!: Observable<GameState>;

  constructor() {}

  public getPlayersList$(): Observable<PlayerInfo[]> {
    return this.playersList$;
  }

  public getCurrentPlayerId$(): Observable<string> {
    return this.currentPlayerId$;
  }

  public getCurrentPlayer$(): Observable<PlayerInfo | undefined> {
    return combineLatest([this.playersList$, this.currentPlayerId$]).pipe(
      map(([playersList, currentPlayerId]) => {
        return playersList.find((player) => player.id === currentPlayerId);
      }),
    );
  }

  public playCurrentPlayerCard(card: Card) {
    combineLatest([this.getCurrentPlayer$(), this.playersList$])
      .pipe(take(1))
      .subscribe(([currentPlayer, playerList]) => {
        if (currentPlayer) {
          currentPlayer.playedCard = card;
          this.playersListSubject.next(playerList);
        }
      });
  }
}
