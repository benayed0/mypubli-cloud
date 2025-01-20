import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../../interfaces/user.interface';
import { BehaviorSubject, Subscription, tap } from 'rxjs';
import { TokenService } from '../token/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private subscriptions: Subscription = new Subscription();

  constructor(
    private oauthService: OAuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    if (isPlatformBrowser(platformId)) {
      if (
        this.tokenService.getToken() &&
        tokenService.loggedInType() === 'google'
      ) {
        this.initConfig();
      }
    }
  }
  loggedIn = new BehaviorSubject(this.tokenService.getToken() !== null);
  initConfig() {
    const authConfig: AuthConfig = {
      // Url of the Identity Provider
      issuer: 'https://accounts.google.com',

      // URL of the SPA to redirect the user to after login
      redirectUri: window.location.origin,

      // The SPA's id. The SPA is registerd with this id at the auth-server
      // clientId: 'server.code',
      clientId: environment.GOOGLE_CLIENT_ID,

      // Just needed if your auth server demands a secret. In general, this
      // is a sign that the auth server is not configured with SPAs in mind
      // and it might not enforce further best practices vital for security
      // such applications.
      dummyClientSecret: environment.GOOGLE_CLIENT_SECRET,

      responseType: 'code',

      // set the scope for the permissions the client should request
      // The first four are defined by OIDC.
      // Important: Request offline_access to get a refresh token
      // The api scope is a usecase specific one
      scope: 'openid profile email',
      disablePKCE: false,
      showDebugInformation: true,
      strictDiscoveryDocumentValidation: false,
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    // Subscribe to token refresh error event
    this.subscriptions.add(
      this.oauthService.events.subscribe((event) => {
        if (event.type === 'discovery_document_loaded') {
        }

        if (event.type === 'token_refresh_error') {
          this.logout();
          console.error('Token refresh error:', event);
        }
        if (event.type === 'token_received') {
          console.log('Token received');
        }
      })
    );
    this.oauthService.loadDiscoveryDocumentAndTryLogin().catch((err) => {
      console.log(err);
    });
  }

  gmailAuth() {
    const token = this.oauthService.getIdToken();
    return this.http.get<{
      success: boolean;
      message: string;
    }>(`${environment.API_URL}user/gmail_auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  emailAuth(email: string, password: string) {
    return this.http.post<{
      success: boolean;
      message: string;
      token: string;
    }>(`${environment.API_URL}user/email_auth`, {
      email,
      password,
    });
  }
  logout() {
    localStorage.removeItem('email_token');
    this.oauthService.logOut();
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
