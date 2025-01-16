import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { Card } from '../../game.types';
import { CommonModule } from '@angular/common';
import { CardIndex, CardSuit } from '../card/card.types';
import { CdkDragRelease, DragDropModule } from '@angular/cdk/drag-drop';
import { PlayerInfo } from '../../interfaces/player-info.interface';

@Component({
  selector: 'app-current-player-cards',
  imports: [CardComponent, CommonModule, DragDropModule],
  templateUrl: './current-player-cards.component.html',
  styleUrl: './current-player-cards.component.scss',
})
export class CurrentPlayerCardsComponent implements OnInit {
  private _playerCards: Card[] = [];
  public dragCoordinates: { x: number; y: number }[] = [];
  private readonly cardWidth = 79;
  private readonly stackedCardOffset = 20;

  @Input({ required: true }) gameTableDropZone!: HTMLDivElement;

  @Input() set playerCards(cards: Card[]) {
    this._playerCards = Array.from(cards).sort((cardA, cardB) => {
      const suitsOrder = Object.values(CardSuit);
      const numbersOrder = Object.values(CardIndex);
      const suitIndexA = suitsOrder.indexOf(cardA.suit);
      const suitIndexB = suitsOrder.indexOf(cardB.suit);
      const numberIndexA = numbersOrder.indexOf(cardA.index);
      const numberIndexB = numbersOrder.indexOf(cardB.index);

      if (suitIndexA === suitIndexB) {
        return numberIndexA - numberIndexB;
      } else {
        return suitIndexA - suitIndexB;
      }
    });
    this.dragCoordinates = this._playerCards.map((_) => ({ x: 0, y: 0 }));
  }

  @Input({ required: true }) currentPlayerInfo?: PlayerInfo;

  @Output() private playedCard = new EventEmitter<Card>();

  get playerCards() {
    return this._playerCards;
  }

  ngOnInit() {
    this.calculateAllDragCoordinates();
  }

  public handleDragRelease(cdkDragRelease: CdkDragRelease, cardIndex: number) {
    let xCoord, yCoord;

    if ('touches' in cdkDragRelease.event) {
      xCoord = cdkDragRelease.event.touches[0].pageX;
      yCoord = cdkDragRelease.event.touches[0].pageY;
    } else {
      xCoord = cdkDragRelease.event.pageX;
      yCoord = cdkDragRelease.event.pageY;
    }

    if (
      this.isCoordinateInsideGameTable(xCoord, yCoord) &&
      this.currentPlayerInfo?.isTurn
    ) {
      const card = this._playerCards[cardIndex];
      this._playerCards.splice(cardIndex, 1);
      this.dragCoordinates.splice(cardIndex, 1);
      this.calculateAllDragCoordinates();
      this.playedCard.emit(card);
    } else {
      this.dragCoordinates[cardIndex] = {
        x:
          this.getInitialOffset() -
          this.cardWidth * cardIndex +
          this.stackedCardOffset * cardIndex,
        y: 0,
      };
    }
  }

  private getInitialOffset() {
    const containerWidth = this.cardWidth * this._playerCards.length;
    const stackedCardsContainerWidth =
      this.cardWidth + (this._playerCards.length - 1) * this.stackedCardOffset;
    return (containerWidth - stackedCardsContainerWidth) / 2;
  }

  private calculateAllDragCoordinates() {
    const initialOffset = this.getInitialOffset();
    console.log(initialOffset);
    for (let i = 0; i < this._playerCards.length; i++) {
      this.dragCoordinates[i] = {
        x: initialOffset - this.cardWidth * i + this.stackedCardOffset * i,
        y: 0,
      };
    }
    console.log(this.dragCoordinates);
  }

  private isCoordinateInsideGameTable(x: number, y: number): boolean {
    const gameTableRect = this.gameTableDropZone.getBoundingClientRect();

    return (
      x >= gameTableRect.left &&
      x <= gameTableRect.right &&
      y >= gameTableRect.top &&
      y <= gameTableRect.bottom
    );
  }
}
