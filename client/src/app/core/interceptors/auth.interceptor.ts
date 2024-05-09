import {HttpHandlerFn, HttpInterceptorFn} from '@angular/common/http';
import {catchError, switchMap, throwError} from "rxjs";
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  const authReq = accessToken ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  }) : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401 && !req.url.endsWith('/auth/login') && !req.url.endsWith('/auth/refresh')) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          return authService.refresh(refreshToken).pipe(
            switchMap(tokens => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokens.accessToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
