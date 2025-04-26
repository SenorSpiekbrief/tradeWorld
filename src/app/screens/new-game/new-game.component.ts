import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import { FileSystemService } from '../../services/filesystem.service';

@Component({
  selector: 'app-new-game',
  standalone:true,
  imports:[MatTabsModule],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent {
  constructor(private router: Router,
        private chunkFileSystemService: FileSystemService
  ) {}
  async pickFolder(): Promise<void> {
    await this.chunkFileSystemService.requestDirectoryAccess();
  }

  startGame(): void {
    this.router.navigate(['/loading']);
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
