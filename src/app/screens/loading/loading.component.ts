import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading',
  standalone:true,
  imports: [MatProgressBarModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  progress = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startLoading();
  }

  startLoading(): void {
    const loadingSteps = [
      'Initializing World...',
      'Generating Player...',
      'Setting Up Market...',
      'Finalizing Setup...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < loadingSteps.length) {
        console.log(loadingSteps[step]); // Simulated logs
        this.progress += 25;
        step++;
      } else {
        clearInterval(interval);
        this.router.navigate(['/gameplay']); // Navigate to game screen
      }
    }, 1000);
  }
}
