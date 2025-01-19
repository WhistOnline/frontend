import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message-display',
  imports: [],
  templateUrl: './message-display.component.html',
  styleUrl: './message-display.component.scss',
})
export class MessageDisplayComponent {
  @Input() message: string = '';
}
