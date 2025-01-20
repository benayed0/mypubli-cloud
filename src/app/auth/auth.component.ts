import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
import { HotToastService } from '@ngneat/hot-toast';
import { MatDialog } from '@angular/material/dialog';
import { EmailAuthComponent } from '../email-auth/email-auth.component';
import { TokenService } from '../services/token/token.service';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements AfterViewInit {
  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router,
    private toastr: HotToastService,
    private dialog: MatDialog,
    private tokenService: TokenService
  ) {
    console.log('auth component');
    if (this.tokenService.loggedInType() === 'google') {
      authService.initConfig();
      oauthService.events.subscribe((e) => {
        console.log(e);

        if (e.type === 'token_received') {
          this.gmailAuth();
        }
      });
    }
  }
  @Input('initConfig') initConfig: boolean = false;
  ngAfterViewInit(): void {
    if (this.initConfig) {
      this.authService.initConfig();
      this.oauthService.events.subscribe((e) => {
        console.log(e);

        if (e.type === 'token_received') {
          this.gmailAuth();
        }
      });
    }
  }
  oAuthLogin() {
    this.authService.initConfig();

    this.oauthService.initLoginFlow();
  }
  gmailAuth() {
    this.authService.gmailAuth().subscribe(({ success, message }) => {
      console.log(success, message);
      if (success) {
        this.authService.loggedIn.next(true);
        this.router.navigate(['/articles']);
      } else {
        if (message === 'user-personal-email-found') {
          this.toastr.error('Utilisateur personnel existant avec cet email', {
            duration: 5000,
          });
        }
        this.authService.logout();
      }
    });
  }
  emailLogin(email?: string) {
    this.dialog
      .open(EmailAuthComponent, { width: '450px', data: { email } })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          const { email, password } = data;
          this.authService
            .emailAuth(email, password)
            .subscribe(({ success, message, token }) => {
              console.log(success, message);

              if (success) {
                this.authService.loggedIn.next(true);
                this.tokenService.setEmailToken(token);
                this.router.navigate(['/articles']);
              } else {
                if (message === 'user-gmail-found') {
                  this.toastr.error(
                    'Utilisateur Gmail existant avec cet email',
                    { duration: 5000 }
                  );
                  this.emailLogin();
                }
                if (message === 'password-incorrect') {
                  this.toastr.error('Mot de passe incorrect', {
                    duration: 5000,
                  });
                  this.emailLogin(email);
                }
                this.authService.logout();
              }
            });
        }
      });
  }
}
