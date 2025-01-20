import { CanActivateFn } from '@angular/router';

export const articleUploadGuard: CanActivateFn = (route, state) => {
  return true;
};
