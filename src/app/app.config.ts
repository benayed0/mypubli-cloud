import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHotToastConfig } from '@ngneat/hot-toast';
import { httpInterceptor } from './interceptors/http.interceptor';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),

    provideHotToastConfig({ visibleToasts: 1 }),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideOAuthClient(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
  ],
};
