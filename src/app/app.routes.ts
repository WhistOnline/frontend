import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GameComponent } from './pages/game/game.component';
import { JoinRoomComponent } from './pages/join-room/join-room.component';
import { RulesComponent } from './pages/rules/rules.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';

// TODO: Make default route on sign in component
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'game', component: GameComponent },
  { path: 'join-room', component: JoinRoomComponent },
  { path: 'rules', component: RulesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
