import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader/loader.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // If a service sets this header, skip the interceptor logic
  if (req.headers.has('X-Skip-Interceptor')) {
    return next(req);
  }
  const oauthService = inject(OAuthService);
  const token = oauthService.getIdToken();
  const backendCall = req.url.includes(environment.API_URL);
  const loaderService = inject(LoaderService);

  loaderService.showLoadingSpinner();
  if (token && backendCall) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  console.log('Request:', req);

  return next(req).pipe(
    finalize(() => {
      loaderService.hideLoadingSpinner(); // Hide loading spinner UI element
    })
  );
};
