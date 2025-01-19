import { Component, Input } from '@angular/core';
import { CardIndex, CardSuit } from './card.types';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() public suit?: CardSuit;
  @Input() public cardIndex?: CardIndex;
  @Input() public flipped: boolean = false;
  @Input() public halo: boolean = false;

  private readonly prefix = '/cards/';

  getImageSource(): string {
    if (this.flipped) {
      return this.prefix + 'back_light.png';
    }

    if (!this.cardIndex || !this.suit) {
      console.error('Bad card given');
      return '';
    }

    return `${this.prefix}${this.suit.toLowerCase()}_${this.cardIndex}.png`;
  }
}
