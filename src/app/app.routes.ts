import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './guards/auth/auth.guard';
import { publicGuard } from './guards/public/public.guard';
import { HomeComponent } from './home/home.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, canActivate: [publicGuard] },
  // { path: '', component: LandingComponent, canActivate: [publicGuard] },
  { path: 'articles', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }, // Catch-all redirect
];
