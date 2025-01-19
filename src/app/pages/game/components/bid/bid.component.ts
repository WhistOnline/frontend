import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Scoreboard } from '../../game.types';
import { PlayerInfo } from '../../interfaces/player-info.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bid',
  imports: [CommonModule],
  templateUrl: './bid.component.html',
  styleUrl: './bid.component.scss',
})
export class BidComponent implements OnChanges {
  @Input() scoreboard!: Scoreboard;
  @Input() playerInfo: PlayerInfo[] = [];
  @Input() currentPlayerInfo?: PlayerInfo;

  @Output() choseBid = new EventEmitter<number>();

  public btnIndices = Array.from({ length: 9 }, (_, i) => i);
  public disabledBtnIdx: number | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (this.scoreboard && this.currentPlayerInfo) {
      const maxBids = this.getRoundFromScoreboard();

      this.btnIndices = Array.from({ length: maxBids + 1 }, (_, i) => i);

      const currentPlayerScoreData = this.scoreboard[this.currentPlayerInfo.id];

      const currentPlayerHasBid =
        currentPlayerScoreData[currentPlayerScoreData.length - 1].bid !==
        undefined;

      if (!currentPlayerHasBid) {
        let allOtherHaveBid = true;
        let bidSum = 0;

        for (const playerInfo of this.playerInfo) {
          if (playerInfo.id === this.currentPlayerInfo.id) {
            continue;
          }

          const currentPlayerScoreData = this.scoreboard[playerInfo.id];
          if (
            currentPlayerScoreData[currentPlayerScoreData.length - 1].bid ===
            undefined
          ) {
            allOtherHaveBid = false;
            break;
          } else {
            bidSum +=
              currentPlayerScoreData[currentPlayerScoreData.length - 1].bid ??
              0;
          }
        }

        if (allOtherHaveBid) {
          this.disabledBtnIdx = maxBids - bidSum;

          if (this.disabledBtnIdx < 0) {
            this.disabledBtnIdx = null;
          }
        }
      }
    }
  }

  public clickedBtn(idx: number) {
    if (idx !== this.disabledBtnIdx) {
      this.choseBid.emit(idx);
    }
  }

  private getRoundFromScoreboard() {
    if (this.currentPlayerInfo) {
      const scoreboardLength =
        this.scoreboard[this.currentPlayerInfo.id].length;

      if (scoreboardLength < 5 || scoreboardLength > 20) {
        return 1;
      }

      if (scoreboardLength > 10 && scoreboardLength < 15) {
        return 8;
      }

      if (scoreboardLength < 11) {
        return scoreboardLength - 4;
      }

      if (scoreboardLength > 14) {
        return 20 - scoreboardLength + 2;
      }
    }

    return 0;
  }
}
