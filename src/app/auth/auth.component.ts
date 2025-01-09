import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { isPlatformBrowser } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private dialog: MatDialog,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(platformId)) {
      this.authService.initConfig();
      oauthService.events.subscribe((e) => {
        if (e.type === 'token_received') {
          this.serverLogin();
        }
      });
    }
  }
  oAuthLogin() {
    this.oauthService.initLoginFlow();
  }
  serverLogin() {
    this.authService.serverLogin().subscribe(({ success, message }) => {
      console.log(success, message);
      if (success) {
        this.authService.loggedIn.next(true);
        this.authService.user.next(
          this.oauthService.getIdentityClaims() as User
        );
        this.router.navigate(['/home']);
      } else {
        this.authService.logout();
      }
    });
  }
}
