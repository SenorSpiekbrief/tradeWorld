import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartMenuComponent } from './screens/start-menu/start-menu.component';
import { LoadingComponent } from './screens/loading/loading.component';

export const routes: Routes = [
  { path: '', component: StartMenuComponent },  // Default route -> Start Menu
  { path: 'new-game', loadComponent: () => import('./screens/new-game/new-game.component').then(m => m.NewGameComponent) },
  { path: 'load-game', loadComponent: () => import('./screens/load-game/load-game.component').then(m => m.LoadGameComponent) }, 
  { path: 'loading', component: LoadingComponent },
  { path: 'gameplay', loadComponent: () => import('./screens/gameplay/gameplay.component').then(m => m.GameplayComponent) },
  { path: 'settings', loadComponent: () => import('./screens/settings/settings.component').then(m => m.SettingsComponent) },
  { path: '**', redirectTo: '' } // Redirect invalid routes to Start Menu
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }
