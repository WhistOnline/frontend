import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentPlayerCardsComponent } from './current-player-cards.component';

describe('CurrentPlayerCardsComponent', () => {
  let component: CurrentPlayerCardsComponent;
  let fixture: ComponentFixture<CurrentPlayerCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentPlayerCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentPlayerCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
