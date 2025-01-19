import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GameComponent } from './pages/game/game.component';
import { JoinRoomComponent } from './pages/join-room/join-room.component';
import { RulesComponent } from './pages/rules/rules.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';
import { WaitingRoomComponent } from './pages/waiting-room/waiting-room.component';

// TODO: Make default route on sign in component
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'game', component: GameComponent, canActivate: [AuthGuard] },
  { path: 'join-room', component: JoinRoomComponent, canActivate: [AuthGuard] },
  {
    path: 'waiting-room',
    component: WaitingRoomComponent,
    canActivate: [AuthGuard],
  },
  { path: 'rules', component: RulesComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'register', component: RegisterPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
