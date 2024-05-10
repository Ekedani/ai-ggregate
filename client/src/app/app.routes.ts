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

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'content/images',
    component: ImageListComponent
  },
  {
    path: 'content/images/:id',
    component: ImageComponent,
    pathMatch: 'full'
  },
  {
    path: 'aggregation/jobs',
    component: AggregationJobListComponent
  },
  {
    path: 'aggregation/images',
    component: AggregatedImageListComponent
  },
  {
    path: 'users',
    component: UsersListComponent,
  },
  {
    path: 'users/:id',
    component: UserComponent,
    pathMatch: 'full'
  },
  {
    path: 'classifiers/images',
    component: ImagesClassificationComponent,
  },
  {
    path: '',
    redirectTo: '/content/images',
    pathMatch: 'full'
  }
];
