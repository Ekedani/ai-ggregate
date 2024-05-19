import {Routes} from '@angular/router';
import {
  AggregationJobListComponent
} from "./features/aggregation-jobs/components/aggregation-job-list/aggregation-job-list.component";
import {
  AggregatedImageListComponent
} from "./features/aggregated-images/components/aggregated-image-list/aggregated-image-list.component";
import {ImageListComponent} from "./features/images/components/image-list/image-list.component";
import {UsersListComponent} from "./features/users/users-list/users-list.component";
import {ImagesClassificationComponent} from "./features/image-classification/images-classification.component";
import {ImageComponent} from "./features/images/components/image/image.component";
import {LoginComponent} from "./features/auth/components/login/login.component";
import {RegisterComponent} from "./features/auth/components/register/register.component";
import {UserComponent} from "./features/users/user/user.component";
import {authGuard} from "./core/guards/auth.guard";
import {noAuthGuard} from "./core/guards/no-auth.guard";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'content/images/:id',
    component: ImageComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  {
    path: 'content/images',
    component: ImageListComponent,
    canActivate: [authGuard]
  },

  {
    path: 'aggregation/jobs',
    component: AggregationJobListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'aggregation/images',
    component: AggregatedImageListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users',
    component: UsersListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users/:id',
    component: UserComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  {
    path: 'classifiers/images',
    component: ImagesClassificationComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/content/images',
    pathMatch: 'full'
  }
];
