import { Injectable } from '@angular/core';
import { PlayerInfo } from '../interfaces/player-info.interface';
import {
  BehaviorSubject,
  combineLatest,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import { Card, GameState, PlayerHand, Scoreboard } from '../game.types';
import { GameSessionService } from './game-session.service';
import { HttpClient } from '@angular/common/http';

// const stubGameState = {
//   playerHands: [
//     { userId: '1', handCards: [], isTurn: false },
//     { userId: '2', handCards: [], isTurn: false },
//     { userId: '3', handCards: [], isTurn: false },
//     {
//       userId: '4',
//       handCards: [
//         { suit: CardSuit.HEARTS, index: CardIndex.TWO },
//         { suit: CardSuit.SPADES, index: CardIndex.KING },
//         { suit: CardSuit.DIAMONDS, index: CardIndex.NINE },
//         { suit: CardSuit.CLUBS, index: CardIndex.FOUR },
//         { suit: CardSuit.HEARTS, index: CardIndex.ACE },
//         { suit: CardSuit.SPADES, index: CardIndex.TEN },
//         { suit: CardSuit.DIAMONDS, index: CardIndex.JACK },
//       ],
//       isTurn: true,
//     },
//   ],
//   cardsPlayed: [
//     { suit: CardSuit.HEARTS, index: CardIndex.THREE },
//     { suit: CardSuit.SPADES, index: CardIndex.QUEEN },
//     { suit: CardSuit.DIAMONDS, index: CardIndex.SIX },
//   ],
//   trumpCard: { suit: CardSuit.DIAMONDS, index: CardIndex.ACE },
//   scoreboard: {
//     '1': [
//       { bid: 2, actual: 2 },
//       { bid: 1, actual: 3 },
//       { bid: 3, actual: 1 },
//       { bid: 0, actual: 2 },
//     ],
//     '2': [
//       { bid: 1, actual: 3 },
//       { bid: 3, actual: 2 },
//       { bid: 2, actual: 3 },
//       { bid: 2, actual: 1 },
//     ],
//     '3': [
//       { bid: 3, actual: 2 },
//       { bid: 2, actual: 1 },
//       { bid: 1, actual: 2 },
//       { bid: 1, actual: 2 },
//     ],
//     '4': [
//       { bid: 0, actual: 1 },
//       { bid: 2, actual: 2 },
//       { bid: 1, actual: 2 },
//       { bid: 3, actual: 2 },
//     ],
//   },
// };

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private currentPlayerPlayedCardSubject: Subject<Card> = new Subject<Card>();
  private currentPlayerBidSubject: Subject<number> = new Subject<number>();

  private readonly stubGameState$!: Observable<GameState>;
  private readonly gameState$!: Observable<GameState>;

  private readonly playersList$!: Observable<PlayerInfo[]>;
  private readonly currentPlayerId$!: Observable<string>;

  constructor(
    private gameSessionService: GameSessionService,
    private httpClient: HttpClient,
  ) {
    this.playersList$ = this.gameSessionService.playerInfo$;
    this.stubGameState$ = this.gameSessionService.gameState$.pipe(
      shareReplay(1),
    );
    this.currentPlayerId$ = this.gameSessionService.currentPlayerName$;
    this.gameState$ = merge(
      this.stubGameState$,
      this.currentPlayerPlayedCardSubject.asObservable().pipe(
        switchMap((card) =>
          combineLatest([this.stubGameState$, this.currentPlayerId$]).pipe(
            take(1),
            map(([gameState, currentPlayerId]) => {
              const currentIdx = gameState.playerHands.findIndex(
                (playerHand) => playerHand.userId === currentPlayerId,
              );

              if (currentIdx + 1 < gameState.playerHands.length) {
                gameState.playerHands[currentIdx + 1].isTurn = true;
              }

              gameState.playerHands[currentIdx].isTurn = false;
              gameState.cardsPlayed.push(card);

              return gameState;
            }),
          ),
        ),
      ),
      this.currentPlayerBidSubject.asObservable().pipe(
        switchMap((bid) =>
          combineLatest([this.stubGameState$, this.currentPlayerId$]).pipe(
            take(1),
            map(([gameState, currentPlayerId]) => {
              const currentIdx = gameState.playerHands.findIndex(
                (playerHand) => playerHand.userId === currentPlayerId,
              );

              gameState.playerHands[
                (currentIdx + 1) % gameState.playerHands.length
              ].isTurn = true;

              gameState.playerHands[currentIdx].isTurn = false;
              gameState.scoreboard[currentPlayerId][
                gameState.scoreboard[currentPlayerId].length - 1
              ].bid = bid;

              return gameState;
            }),
          ),
        ),
      ),
    ).pipe(shareReplay(1));
  }

  public getPlayerList$(): Observable<PlayerInfo[]> {
    return combineLatest([this.playersList$, this.gameState$]).pipe(
      map(([playerList, gameState]: [PlayerInfo[], GameState]) => {
        return playerList.map((playerInfo) => {
          const playerIdx = gameState.playerHands.findIndex(
            (playerHand: PlayerHand) => playerHand.userId === playerInfo.id,
          );

          if (playerIdx >= 0) {
            if (playerIdx < gameState.cardsPlayed.length) {
              return {
                ...playerInfo,
                playedCard: gameState.cardsPlayed[playerIdx],
                isTurn: gameState.playerHands[playerIdx].isTurn,
              };
            } else {
              return {
                ...playerInfo,
                isTurn: gameState.playerHands[playerIdx].isTurn,
              };
            }
          }

          return playerInfo;
        });
      }),
    );
  }

  public getCurrentPlayerId$(): Observable<string> {
    return this.currentPlayerId$;
  }

  public getCurrentPlayer$(): Observable<PlayerInfo | undefined> {
    return combineLatest([
      this.getPlayerList$(),
      this.getCurrentPlayerId$(),
    ]).pipe(
      map(([playersList, currentPlayerId]) => {
        return playersList.find((player) => player.id === currentPlayerId);
      }),
    );
  }

  public getCurrentPlayerCards$(): Observable<Card[]> {
    return combineLatest([this.gameState$, this.currentPlayerId$]).pipe(
      map(([gameState, currentPlayerId]: [GameState, string]) => {
        const cards = gameState.playerHands.find(
          (playerHand) => playerHand.userId === currentPlayerId,
        )?.handCards;
        if (!cards) return [];

        return cards;
      }),
    );
  }

  public getTrumpCard$(): Observable<Card | null> {
    return this.gameState$.pipe(
      map((gameState) => gameState.trumpCard ?? null),
    );
  }

  public getPlayedCards$(): Observable<Card[]> {
    return this.gameState$.pipe(map((gameState) => gameState.cardsPlayed));
  }

  public getScoreBoard$(): Observable<Scoreboard> {
    return this.gameState$.pipe(map((gameState) => gameState.scoreboard));
  }

  public getIsBid$(): Observable<boolean> {
    return this.gameState$.pipe(
      map((gameState) => {
        const scoreboard = gameState.scoreboard;

        return !Object.keys(scoreboard)
          .map((userId) => scoreboard[userId][scoreboard[userId].length - 1])
          .every((bidActualPair) => bidActualPair.bid !== undefined);
      }),
    );
  }

  public playCard(card: Card): void {
    this.currentPlayerPlayedCardSubject.next(card);
    combineLatest([
      this.gameSessionService.currentPlayerName$,
      this.gameSessionService.currentPlayerToken$,
      this.gameSessionService.gameCode$,
    ])
      .pipe(take(1))
      .subscribe(([currentPlayerName, currentPlayerToken, gameCode]) => {
        this.httpClient
          .post(
            `http://localhost:8200/card?username=${currentPlayerName}&gameCode=${gameCode}`,
            {
              value: card.index,
              suit: card.suit,
            },
            { headers: { Authorization: `Bearer: ${currentPlayerToken}` } },
          )
          .subscribe(console.log);
      });
  }

  public bidForHand(bid: number): void {
    this.currentPlayerBidSubject.next(bid);
    combineLatest([
      this.gameSessionService.currentPlayerName$,
      this.gameSessionService.currentPlayerToken$,
      this.gameSessionService.gameCode$,
    ])
      .pipe(take(1))
      .subscribe(([currentPlayerName, currentPlayerToken, gameCode]) => {
        this.httpClient
          .post(
            `http://localhost:8200/bid?username=${currentPlayerName}&gameCode=${gameCode}&bidValue=${bid}`,
            {},
            { headers: { Authorization: `Bearer: ${currentPlayerToken}` } },
          )
          .subscribe(console.log);
      });
  }
}
