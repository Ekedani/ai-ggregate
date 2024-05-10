import {Provider} from "@angular/core";

export interface AggregatedData {
  provider: Provider;
  aggregationJob?: string;
  originalId?: string;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  author?: string;
  createdAt?: Date;
  publicationUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: Date;
}
