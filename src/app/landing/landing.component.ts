import { Component, inject } from '@angular/core';
import { AuthComponent } from '../auth/auth.component';
import { AsyncPipe, NgStyle } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../services/loader/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [AuthComponent, AsyncPipe, MatProgressSpinnerModule, NgStyle],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  initConfig = false;
  constructor(private router: Router) {
    this.router.routerState.root.queryParams.subscribe((params) => {
      if (Object.keys(params).length === 0) {
        this.loading = false;
        console.log('No query parameters');
      } else {
        this.initConfig = params['scope'] !== null;
        console.log('Query parameters:', params);
      }
    });
  }
  loading = true;
  loaderService = inject(LoaderService);
}
