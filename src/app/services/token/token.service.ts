import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private oauthService: OAuthService) {}

  getToken() {
    return (
      this.oauthService.getIdToken() ?? localStorage.getItem('email_token')
    );
  }
}
