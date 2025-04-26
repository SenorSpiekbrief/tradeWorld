import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StartMenuComponent } from './screens/start-menu/start-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tradeWorld';
}
