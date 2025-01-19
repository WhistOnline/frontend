import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  OnDestroy,
  QueryList,
} from '@angular/core';
import {
  combineLatest,
  Observable,
  startWith,
  Subscriber,
  Subscription,
} from 'rxjs';

type Dimensions = {
  width: number;
  height: number;
};

type Offset = {
  top: number;
  left: number;
};

type OffsetWithRotate = Offset & {
  rotate: number;
};

@Directive({
  selector: '[appElementsPositioning]',
})
export class ElementsPositioningDirective implements AfterViewInit, OnDestroy {
  @ContentChildren('playedCards', { descendants: true })
  playedCards!: QueryList<ElementRef>;
  @ContentChildren('playerWrapper', { descendants: true })
  playerWrapper!: QueryList<ElementRef>;

  private resizeObserver?: ResizeObserver;
  private positioningObserver?: Subscriber<unknown>;

  private combinedPositioningSubscription?: Subscription;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const positioning$ = new Observable((observer) => {
      this.positioningObserver = observer;
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.positioningObserver?.next(null);
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);

    this.combinedPositioningSubscription = combineLatest([
      this.playedCards.changes.pipe(startWith(null)),
      this.playerWrapper.changes.pipe(startWith(null)),
      positioning$,
    ]).subscribe(() => {
      this.positionElements();
    });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.positioningObserver?.complete();

    this.combinedPositioningSubscription?.unsubscribe();
  }

  private positionElements() {
    const gameContainerDimensions = this.getGameContainerDimensions();

    const table = this.elementRef.nativeElement.querySelector(
      '.game-table',
    ) as HTMLElement | null;

    if (!table) {
      console.warn('Game Table not found!');
      return;
    }

    const tableDimensions = this.getTableDimensions();
    table.style.width = `${tableDimensions.width}px`;
    table.style.height = `${tableDimensions.height}px`;

    const playerContainers = this.elementRef.nativeElement.querySelectorAll(
      '.player-wrapper',
    ) as NodeListOf<HTMLElement>;

    for (const [index, playerContainer] of playerContainers.entries()) {
      const player = playerContainer.querySelector(
        '.player-head-wrapper',
      ) as HTMLElement;
      const playerCard = playerContainer.querySelector(
        '.card-wrapper',
      ) as HTMLElement;

      if (!player) {
        console.warn('Game Player not found.');
        continue;
      }

      const offset = this.getNthPlayerOffsets(index, tableDimensions);
      player.style.top = gameContainerDimensions.height / 2 + offset.top + 'px';
      player.style.left =
        gameContainerDimensions.width / 2 + offset.left + 'px';

      if (!playerCard) {
        continue;
      }

      const cardOffset = this.getNthCardOffsets(index, offset);
      playerCard.style.top =
        gameContainerDimensions.height / 2 + cardOffset.top + 'px';
      playerCard.style.left =
        gameContainerDimensions.width / 2 + cardOffset.left + 'px';
      if (cardOffset.rotate !== 0) {
        playerCard.style.transform = `translate(-50%, -50%) rotate(${cardOffset.rotate}deg)`;
      }
    }

    const currentPlayerCardsWrapper =
      this.elementRef.nativeElement.querySelector(
        '.current-player-screen-wrapper',
      ) as HTMLElement;

    currentPlayerCardsWrapper.style.top = `${gameContainerDimensions.height / 2 + tableDimensions.height / 2 + 100}px`;
    currentPlayerCardsWrapper.style.left = `${gameContainerDimensions.width / 2}px`;

    const currentPlayerBidWrapper = this.elementRef.nativeElement.querySelector(
      '.current-player-bid-wrapper',
    ) as HTMLElement;

    if (currentPlayerBidWrapper) {
      currentPlayerBidWrapper.style.top = `${gameContainerDimensions.height / 2 + tableDimensions.height / 2 - 100}px`;
      currentPlayerBidWrapper.style.left = `${gameContainerDimensions.width / 2}px`;
    }

    const currentPlayerPlayedCardWrapper =
      this.elementRef.nativeElement.querySelector(
        '.current-player-played-card-wrapper',
      ) as HTMLElement;

    if (currentPlayerPlayedCardWrapper) {
      currentPlayerPlayedCardWrapper.style.top = `${gameContainerDimensions.height / 2 + tableDimensions.height / 2 - 75}px`;
      currentPlayerPlayedCardWrapper.style.left = `${gameContainerDimensions.width / 2}px`;
    }

    const trumpCardWrapper = this.elementRef.nativeElement.querySelector(
      '.trump-card-wrapper',
    ) as HTMLElement;

    if (trumpCardWrapper) {
      trumpCardWrapper.style.top = `${gameContainerDimensions.height / 2}px`;
      trumpCardWrapper.style.left = `${gameContainerDimensions.width / 2}px`;
    }

    const messageDisplayWrapper = this.elementRef.nativeElement.querySelector(
      '.message-display-wrapper',
    ) as HTMLElement;
    if (messageDisplayWrapper) {
      messageDisplayWrapper.style.top = `${gameContainerDimensions.height / 2 + tableDimensions.height / 2 + 60}px`;
      messageDisplayWrapper.style.left = `${gameContainerDimensions.width / 2 + tableDimensions.width / 4}px`;
    }
  }

  private getGameContainerDimensions(): Dimensions {
    return {
      width: this.elementRef.nativeElement.clientWidth,
      height: this.elementRef.nativeElement.clientHeight,
    };
  }

  private getTableDimensions(): Dimensions {
    // Calculate based on window
    return { width: 879, height: 468 };
  }

  private getPlayerContainerDimensions(): Dimensions {
    return { width: 100, height: 100 };
  }

  private getNthPlayerOffsets(n: number, tableDimensions: Dimensions): Offset {
    const playerContainerDimensions = this.getPlayerContainerDimensions();

    if (n === 0) {
      return {
        top: 0,
        left: -tableDimensions.width / 2 - playerContainerDimensions.width / 2,
      };
    } else if (n === 1) {
      return {
        top: -tableDimensions.height / 2 - playerContainerDimensions.height / 2,
        left: 0,
      };
    } else if (n === 2) {
      return {
        top: 0,
        left: tableDimensions.width / 2 + playerContainerDimensions.width / 2,
      };
    } else {
      return { top: 0, left: 0 };
    }
  }

  private getNthCardOffsets(n: number, playerOffset: Offset): OffsetWithRotate {
    if (n === 0) {
      return { top: 0, left: playerOffset.left + 150, rotate: 90 };
    } else if (n === 1) {
      return { top: playerOffset.top + 130, left: 0, rotate: 0 };
    } else if (n === 2) {
      return { top: 0, left: playerOffset.left - 150, rotate: -90 };
    } else {
      return { top: 0, left: 0, rotate: 0 };
    }
  }
}
