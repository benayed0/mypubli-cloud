import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader/loader.service';
import { AuthService } from '../services/auth/auth.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // If a service sets this header, skip the interceptor logic
  const shouldSkipLoader = req.headers.get('X-Skip-Loader');

  const oauthService = inject(AuthService);
  const token = oauthService.getToken();
  const backendCall = req.url.includes(environment.API_URL);
  const loaderService = inject(LoaderService);
  if (!shouldSkipLoader) {
    loaderService.showLoadingSpinner();
  }
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
