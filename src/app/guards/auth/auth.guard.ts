import { inject } from '@angular/core';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard = () => {
  // Check if the user is logged in
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loggedIn.pipe(
    map(async (isLogged) => {
      if (isLogged) {
        return true;
      } else {
        router.navigate(['home']);
        return false;
      }
    })
  );
};
