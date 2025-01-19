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

  public getTabularData(): { name: string; bid?: number; actual?: number }[] {
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
          });
        }
      }
    }

    return tabularData;
  }
}
