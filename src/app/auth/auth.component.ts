import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
import { HotToastService } from '@ngneat/hot-toast';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router,
    private toastr: HotToastService
  ) {
    this.authService.initConfig();
    oauthService.events.subscribe((e) => {
      if (e.type === 'token_received') {
        console.log('Token received');

        this.serverLogin();
      }
    });
  }
  oAuthLogin() {
    this.oauthService.initLoginFlow();
  }
  serverLogin() {
    this.authService.gmailAuth().subscribe(({ success, message }) => {
      console.log(success, message);
      if (success) {
        this.authService.loggedIn.next(true);
        this.authService.user.next(
          this.oauthService.getIdentityClaims() as User
        );
        this.router.navigate(['/articles']);
      } else {
        this.authService.logout();
      }
    });
  }
  emailLogin() {
    this.toastr.info('Bientôt disponible...');
  }
}
