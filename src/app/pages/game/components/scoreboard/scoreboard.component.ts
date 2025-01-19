import { Component, Input } from '@angular/core';
import { Scoreboard } from '../../game.types';
import { PlayerInfo } from '../../interfaces/player-info.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scoreboard',
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss',
})
export class ScoreboardComponent {
  @Input() scoreboard!: Scoreboard;
  @Input() playerInfoList: PlayerInfo[] = [];

  public getTabularData(): {
    name: string;
    bid?: number;
    actual?: number;
    totalScore: number;
  }[] {
    const tabularData = [];

    if (this.scoreboard) {
      for (const userId of Object.keys(this.scoreboard)) {
        const playerInfo = this.playerInfoList.find(
          (playerInfo) => playerInfo.id === userId,
        );

        if (playerInfo) {
          const scoreData =
            this.scoreboard[userId][this.scoreboard[userId].length - 1];

          tabularData.push({
            name: playerInfo.name,
            bid: scoreData.bid,
            actual: scoreData.actual,
            totalScore: this.getTotalScore(userId),
          });
        }
      }
    }

    return tabularData;
  }

  private getTotalScore(userId: string): number {
    if (this.scoreboard) {
      const scoreData = this.scoreboard[userId];
      let score = 0;

      scoreData.forEach((bidData, idx) => {
        if (idx !== scoreData.length - 1) {
          if (bidData.bid === bidData.actual) {
            score += 5 + (bidData.bid ?? 0);
          } else {
            score -= Math.abs((bidData.bid ?? 0) - (bidData.actual ?? 0));
          }
        }
      });

      return score;
    }

    return 0;
  }
}
