import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);
  const token = oauthService.getIdToken();
  const backendCall = req.url.includes(environment.API_URL);

  if (token && backendCall) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
};
