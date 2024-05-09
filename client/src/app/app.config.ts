import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {provideNativeDateAdapter} from "@angular/material/core";
import {provideToastr} from "ngx-toastr";

import {authInterceptor} from "./core/interceptors/auth.interceptor";
import {NgxPaginationModule} from "ngx-pagination";
import {NgxMasonryModule} from "ngx-masonry";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideHttpClient(withInterceptors([
      authInterceptor
    ])),
    provideToastr(),
    importProvidersFrom(NgxPaginationModule),
    importProvidersFrom(NgxMasonryModule)
  ]
};
