import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {map} from "rxjs";

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getIsLoggedIn().pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        router.navigate(['/'], {queryParams: {returnUrl: state.url}});
        return false;
      }
      return true;
    })
  );
};
