import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  interval,
  of,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  takeWhile,
  timer,
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CardIndex, CardSuit } from '../components/card/card.types';
import { Card, GameState } from '../game.types';
import { PlayerInfo } from '../interfaces/player-info.interface';

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private currentUserName: string = '';
  private currentUserToken: string = '';

  private playerInfoSubject: Subject<PlayerInfo[]> = new ReplaySubject();
  private gameStateSubject: Subject<GameState> = new ReplaySubject();
  private gameCodeSubject: Subject<string> = new ReplaySubject();
  private currentPlayerNameSubject: Subject<string> = new ReplaySubject();
  private currentPlayerTokenSubject: Subject<string> = new ReplaySubject();

  public playerInfo$ = this.playerInfoSubject.asObservable();
  public gameState$ = this.gameStateSubject.asObservable();
  public gameCode$ = this.gameCodeSubject.asObservable();
  public currentPlayerName$ = this.currentPlayerNameSubject.asObservable();
  public currentPlayerToken$ = this.currentPlayerTokenSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    const userInfo = sessionStorage.getItem('currentUser') || '';
    if (userInfo) {
      const parsedData = JSON.parse(userInfo);
      this.currentUserName = parsedData.username;
      this.currentUserToken = parsedData.token;
      this.currentPlayerNameSubject.next(this.currentUserName);
      this.currentPlayerTokenSubject.next(this.currentUserToken);
    }
    this.gameCodeSubject.next('81GLL8');
    this.startGame('81GLL8');
  }

  prepareGameStart(gameCode: string) {
    this.gameCodeSubject.next(gameCode);
    timer(0, 5000)
      .pipe(
        switchMap(() =>
          this.httpClient
            .get<
              Array<any>
            >(`http://localhost:8200/game-session/ready?gameCode=${gameCode}`, { headers: { Authorization: `Bearer ${this.currentUserToken}` } })
            .pipe(
              catchError((err) => {
                console.error(err);
                return of([]);
              }),
            ),
        ),
        takeWhile((response: Array<any>) => response.length < 4, true),
      )
      .subscribe((response) => {
        if (response.length === 4) {
          this.startGame(gameCode);
        }
      });
  }

  startGame(gameCode: string) {
    const serverGameState$ = timer(0, 5000).pipe(
      switchMap((_) =>
        this.httpClient
          .get(
            `http://localhost:8200/game-session?username=${this.currentUserName}&gameCode=${gameCode}`,
            { headers: { Authorization: `Bearer ${this.currentUserToken}` } },
          )
          .pipe(
            catchError((err) => {
              console.log('Caught Error', err);
              console.log('Did not start Game');

              return of(null);
            }),
          ),
      ),
      shareReplay(1),
    );

    serverGameState$.subscribe((serverGameState: object | null) => {
      if (serverGameState) {
        this.gameStateSubject.next(
          this.mapServerGameStateToGameState(serverGameState),
        );
      }
    });
    serverGameState$
      .pipe(takeWhile((response) => !response, true))
      .subscribe((serverGameState: object | null) => {
        if (serverGameState) {
          this.playerInfoSubject.next(
            this.mapServerGameStateToPlayerInfo(serverGameState),
          );
        }
      });
  }

  private mapServerGameStateToPlayerInfo(serverGameState: any) {
    const playerInfo = serverGameState.hand.playOrder.map((username: any) => ({
      id: username,
      name: username,
      isTurn: false,
    }));
    return playerInfo;
  }

  private mapServerGameStateToGameState(serverGameState: any) {
    let gameState: any = {};

    function rotateArray(arr: Array<any>, n: number): Array<any> {
      // Ensure n is within bounds and handle negative values of n
      n = n % arr.length;
      if (n < 0) {
        n += arr.length; // Handle negative rotation by making it positive
      }
      return arr.slice(-n).concat(arr.slice(0, -n));
    }

    gameState.playerHands = (serverGameState.hand.playOrder as Array<any>).map(
      (username: string, idx: number) => {
        if (username === serverGameState.hand.username) {
          return {
            userId: username,
            handCards: serverGameState.hand.hand.map((serverCard: any) =>
              this.mapServerCardToGameCard(serverCard),
            ),
            isTurn: idx === 0,
          };
        } else {
          return {
            userId: username,
            handCards: [],
            isTurn: idx === 0,
          };
        }
      },
    );

    gameState.playerHands = rotateArray(
      gameState.playerHands,
      serverGameState.cardsPlayed.length,
    );

    gameState.cardsPlayed = serverGameState.cardsPlayed.map((serverCard: any) =>
      this.mapServerCardToGameCard(serverCard),
    );
    if (serverGameState.trumpCard) {
      gameState.trumpCard = this.mapServerCardToGameCard(
        serverGameState.trumpCard,
      );
    }
    gameState.scoreboard = {};
    serverGameState.scoreBoard.userScores.forEach((userScore: any) => {
      gameState.scoreboard[userScore.username] = userScore.scoreDetails
        .sort((a: any, b: any) => a.roundNo - b.roundNo)
        .map((scoreDetails: any) => ({
          ...(scoreDetails.bid !== null ? { bid: scoreDetails.bid } : {}),
          actual: scoreDetails.tricksWon === null ? 0 : scoreDetails.tricksWon,
        }));
    });

    return gameState;
  }

  private mapServerCardToGameCard(server: {
    value: string;
    suit: string;
  }): Card {
    switch (server.suit) {
      case 'Spades':
        return {
          suit: CardSuit.SPADES,
          index: server.value as CardIndex,
        };
      case 'Hearts':
        return {
          suit: CardSuit.HEARTS,
          index: server.value as CardIndex,
        };
      case 'Clubs':
        return {
          suit: CardSuit.CLUBS,
          index: server.value as CardIndex,
        };
      default:
        return {
          suit: CardSuit.DIAMONDS,
          index: server.value as CardIndex,
        };
    }
  }
}
