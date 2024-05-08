import {Routes} from '@angular/router';
import {
  AggregationJobListComponent
} from "./features/aggregation-jobs/components/aggregation-job-list/aggregation-job-list.component";
import {
  AggregatedImageListComponent
} from "./features/aggregated-images/components/aggregated-image-list/aggregated-image-list.component";
import {ImageListComponent} from "./features/images/components/image-list/image-list.component";

export const routes: Routes = [
  {
    path: 'content/images',
    component: ImageListComponent
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
    path: '',
    redirectTo: '/content/images',
    pathMatch: 'full'
  }
];
