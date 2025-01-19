import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerComponent } from './components/player/player.component';
import { ElementsPositioningDirective } from './directives/elements-positioning.directive';
import { CardComponent } from './components/card/card.component';
import { Card, Scoreboard } from './game.types';
import { CurrentPlayerCardsComponent } from './components/current-player-cards/current-player-cards.component';
import { PlayerInfo } from './interfaces/player-info.interface';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { Observable, combineLatest, map, Subscription, tap } from 'rxjs';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { BidComponent } from './components/bid/bid.component';
import { MessageDisplayComponent } from './components/message-display/message-display.component';

@Component({
  selector: 'app-game',
  imports: [
    PlayerComponent,
    ElementsPositioningDirective,
    CardComponent,
    CurrentPlayerCardsComponent,
    CommonModule,
    ScoreboardComponent,
    BidComponent,
    MessageDisplayComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  public currentPlayer?: PlayerInfo;

  private currentPlayerSubscription?: Subscription;
  private nonCurrentPlayersListSubscription?: Subscription;
  private trumpCardsSubscription?: Subscription;
  private playedCardsSubscription?: Subscription;
  private scoreboardSubscription?: Subscription;
  private currentPlayerCardsSubscription!: Subscription;
  private playerListSubscription?: Subscription;
  private isBidSubscription?: Subscription;
  private messageSubscription?: Subscription;

  public nonCurrentPlayerList: PlayerInfo[] = [];
  public trumpCard: Card | null = null;
  public playedCards: Card[] = [];
  public scoreboard!: Scoreboard;
  public currentPlayerCards: Card[] = [];
  public playerList: PlayerInfo[] = [];
  public isBid: boolean = false;

  public message: string = '';

  public constructor(public readonly gameService: GameService) {}

  ngOnInit() {
    this.currentPlayerSubscription = this.gameService
      .getCurrentPlayer$()
      .subscribe((currentPlayer) => {
        console.log('Current Player', currentPlayer);
        this.currentPlayer = currentPlayer;
      });
    this.nonCurrentPlayersListSubscription =
      this.getNonCurrentPlayersList$().subscribe((playerList) => {
        this.nonCurrentPlayerList = playerList;
      });
    this.currentPlayerCardsSubscription = this.gameService
      .getCurrentPlayerCards$()
      .subscribe((playerCards) => {
        this.currentPlayerCards = playerCards;
      });
    this.trumpCardsSubscription = this.gameService
      .getTrumpCard$()
      .subscribe((trumpCard) => {
        this.trumpCard = trumpCard;
      });
    this.playedCardsSubscription = this.gameService
      .getPlayedCards$()
      .subscribe((playedCards) => {
        this.playedCards = playedCards;
      });
    this.scoreboardSubscription = this.gameService
      .getScoreBoard$()
      .subscribe((scoreboard) => {
        this.scoreboard = scoreboard;
        this.generateMessageForDisplay();
      });
    this.playerListSubscription = this.gameService
      .getPlayerList$()
      .subscribe((playerList) => {
        this.playerList = playerList;
      });
    this.isBidSubscription = this.gameService.getIsBid$().subscribe((isBid) => {
      this.isBid = isBid;
      this.generateMessageForDisplay();
    });
    this.messageSubscription = combineLatest([
      this.gameService.getCurrentPlayer$(),
      this.gameService.getPlayerList$(),
      this.gameService.getIsBid$(),
    ]).subscribe(([currentPlayer, playerList, isBid]) => {
      let message = '';
      if (currentPlayer && playerList) {
        if (currentPlayer.isTurn) {
          message = 'Your Turn';
        } else {
          const playerTurn = playerList.find((playerInfo) => playerInfo.isTurn);
          if (playerTurn) {
            message = `${playerTurn.name}'s Turn`;
          } else {
            this.message = 'Waiting...';
            return;
          }
        }
      }

      if (isBid) {
        message += ' to Bid';
      } else {
        message += ' to Play';
      }

      this.message = message;
    });
  }

  ngOnDestroy() {
    this.currentPlayerSubscription?.unsubscribe();
    this.nonCurrentPlayersListSubscription?.unsubscribe();
    this.trumpCardsSubscription?.unsubscribe();
    this.playedCardsSubscription?.unsubscribe();
    this.scoreboardSubscription?.unsubscribe();
    this.currentPlayerCardsSubscription?.unsubscribe();
    this.playerListSubscription?.unsubscribe();
    this.isBidSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
  }

  handleCardPlayed(card: Card) {
    this.gameService.playCard(card);
  }

  handleBid(bid: number) {
    this.gameService.bidForHand(bid);
  }

  public getNonCurrentPlayersList$(): Observable<PlayerInfo[]> {
    return combineLatest([
      this.gameService.getPlayerList$(),
      this.gameService.getCurrentPlayerId$(),
    ]).pipe(
      map(([playerList, currentPlayerId]) =>
        playerList.filter((playerInfo) => playerInfo.id !== currentPlayerId),
      ),
    );
  }

  private generateMessageForDisplay() {
    let message = '';
    if (this.currentPlayer && this.playerList) {
      if (this.currentPlayer.isTurn) {
        message = 'Your Turn';
      } else {
        const playerTurn = this.playerList.find(
          (playerInfo) => playerInfo.isTurn,
        );
        if (playerTurn) {
          message = `${playerTurn.name}'s Turn`;
        } else {
          this.message = 'Waiting...';
          return;
        }
      }
    }

    if (this.isBid) {
      message += ' to Bid';
    } else {
      message += ' to Play';
    }

    this.message = message;
  }
}
