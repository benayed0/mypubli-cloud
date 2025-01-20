import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private oauthService: OAuthService) {}

  loggedInType() {
    console.log(
      this.oauthService.getIdToken(),
      localStorage.getItem('email_token')
    );

    return this.oauthService.getIdToken() !== null
      ? 'google'
      : localStorage.getItem('email_token') !== null
      ? 'email'
      : 'none';
  }
  getToken() {
    return (
      this.oauthService.getIdToken() ?? localStorage.getItem('email_token')
    );
  }
  setEmailToken(token: string) {
    return localStorage.setItem('email_token', token);
  }
}
