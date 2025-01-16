import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  @Input({ required: true }) playerName: string = '';
  @Input() active: boolean = false;
}
