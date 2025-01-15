import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const publicGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loggedIn.pipe(
    map(async (isLogged) => {
      console.log(isLogged);
      if (!isLogged) {
        return true;
      } else {
        router.navigate(['articles']);
        return false;
      }
    })
  );
};
