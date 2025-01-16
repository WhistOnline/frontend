import { CardIndex, CardSuit } from './components/card/card.types';

export type Card = {
  suit: CardSuit;
  index: CardIndex;
};

export type Scoreboard = {
  [userId in string]: {
    bid: number;
    actual?: number;
  }[];
};

export type PlayerHand = {
  userId: string;
  handCards?: Card[];
  isTurn: boolean;
};

export type GameState = {
  playerHands: PlayerHand[];
  cardsPlayed: Card[];
  trumpCard?: Card;
  scoreboard: Scoreboard;
};
