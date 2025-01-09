import { Component, inject } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AsyncPipe } from '@angular/common';
import { User } from '../interfaces/user.interface';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  authservice = inject(AuthService);
  constructor() {
    this.authservice.user.subscribe((user) => {
      this.user = user;
    });
  }
  user: User | null = null;
}
