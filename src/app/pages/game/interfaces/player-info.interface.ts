import { Card } from '../game.types';

export interface PlayerInfo {
  id: string;
  name: string;
  isTurn: boolean;
  playedCard?: Card;
}
