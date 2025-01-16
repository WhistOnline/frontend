import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerComponent } from './components/player/player.component';
import { ElementsPositioningDirective } from './directives/elements-positioning.directive';
import { CardComponent } from './components/card/card.component';
import { Card } from './game.types';
import { CardIndex, CardSuit } from './components/card/card.types';
import { CurrentPlayerCardsComponent } from './components/current-player-cards/current-player-cards.component';
import { PlayerInfo } from './interfaces/player-info.interface';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { Observable, combineLatest, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [
    PlayerComponent,
    ElementsPositioningDirective,
    CardComponent,
    CurrentPlayerCardsComponent,
    CommonModule,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  public readonly stubCards: Card[] = [
    { suit: CardSuit.CLUBS, index: CardIndex.FIVE },
    { suit: CardSuit.HEARTS, index: CardIndex.SIX },
    { suit: CardSuit.SPADES, index: CardIndex.ACE },
    { suit: CardSuit.DIAMONDS, index: CardIndex.QUEEN },
    { suit: CardSuit.CLUBS, index: CardIndex.TEN },
  ];

  public currentPlayer?: PlayerInfo;
  private currentPlayerSubscription?: Subscription;

  public constructor(public readonly gameService: GameService) {}

  ngOnInit() {
    this.currentPlayerSubscription = this.gameService
      .getCurrentPlayer$()
      .subscribe((currentPlayer) => {
        this.currentPlayer = currentPlayer;
      });
  }

  ngOnDestroy() {
    this.currentPlayerSubscription?.unsubscribe();
  }

  handleCardPlayed(card: Card) {
    this.gameService.playCurrentPlayerCard(card);
  }

  public getNonCurrentPlayersList$(): Observable<PlayerInfo[]> {
    return combineLatest([
      this.gameService.getPlayersList$(),
      this.gameService.getCurrentPlayerId$(),
    ]).pipe(
      map(([playerList, currentPlayerId]) =>
        playerList.filter((playerInfo) => playerInfo.id !== currentPlayerId),
      ),
    );
  }
}
