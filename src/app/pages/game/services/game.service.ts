import { Injectable } from '@angular/core';
import { PlayerInfo } from '../interfaces/player-info.interface';
import {
  BehaviorSubject,
  combineLatest,
  map,
  merge,
  Observable,
  share,
  shareReplay,
  Subject,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { Card, GameState, PlayerHand, Scoreboard } from '../game.types';
import { CardIndex, CardSuit } from '../components/card/card.types';

const stubGameState = {
  playerHands: [
    { userId: '1', handCards: [], isTurn: false },
    { userId: '2', handCards: [], isTurn: false },
    { userId: '3', handCards: [], isTurn: false },
    {
      userId: '4',
      handCards: [
        { suit: CardSuit.HEARTS, index: CardIndex.TWO },
        { suit: CardSuit.SPADES, index: CardIndex.KING },
        { suit: CardSuit.DIAMONDS, index: CardIndex.NINE },
        { suit: CardSuit.CLUBS, index: CardIndex.FOUR },
        { suit: CardSuit.HEARTS, index: CardIndex.ACE },
        { suit: CardSuit.SPADES, index: CardIndex.TEN },
        { suit: CardSuit.DIAMONDS, index: CardIndex.JACK },
      ],
      isTurn: true,
    },
  ],
  cardsPlayed: [
    // { suit: CardSuit.HEARTS, index: CardIndex.THREE },
    // { suit: CardSuit.SPADES, index: CardIndex.QUEEN },
    // { suit: CardSuit.DIAMONDS, index: CardIndex.SIX },
  ],
  trumpCard: { suit: CardSuit.DIAMONDS, index: CardIndex.ACE },
  scoreboard: {
    '1': [
      { bid: 2, actual: 2 },
      { bid: 1, actual: 3 },
      { bid: 3, actual: 1 },
      { bid: 0, actual: 2 },
      { bid: 1 },
    ],
    '2': [
      { bid: 1, actual: 3 },
      { bid: 3, actual: 2 },
      { bid: 2, actual: 3 },
      { bid: 2, actual: 1 },
      { bid: 3 },
    ],
    '3': [
      { bid: 3, actual: 2 },
      { bid: 2, actual: 1 },
      { bid: 1, actual: 2 },
      { bid: 1, actual: 2 },
      { bid: 3 },
    ],
    '4': [
      { bid: 0, actual: 1 },
      { bid: 2, actual: 2 },
      { bid: 1, actual: 2 },
      { bid: 3, actual: 3 },
      {},
    ],
  },
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly playersListSubject: BehaviorSubject<PlayerInfo[]> =
    new BehaviorSubject<PlayerInfo[]>([
      {
        id: '1',
        name: 'Player 1',
        isTurn: false,
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
  private currentPlayerPlayedCardSubject: Subject<Card> = new Subject<Card>();
  private currentPlayerBidSubject: Subject<number> = new Subject<number>();

  private readonly stubGameState$: Observable<GameState> = timer(0, 50000).pipe(
    map((_) => {
      return JSON.parse(JSON.stringify(stubGameState));
    }),
    shareReplay(1),
  );
  private readonly gameState$: Observable<GameState> = merge(
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

  private readonly currentPlayerId$: Observable<string> = new BehaviorSubject(
    '4',
  ).asObservable();
  private readonly playersList$: Observable<PlayerInfo[]> =
    this.playersListSubject.asObservable();

  constructor() {}

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
    // TODO Also make the request
    this.currentPlayerPlayedCardSubject.next(card);
  }

  public bidForHand(bid: number): void {
    this.currentPlayerBidSubject.next(bid);
  }
}
