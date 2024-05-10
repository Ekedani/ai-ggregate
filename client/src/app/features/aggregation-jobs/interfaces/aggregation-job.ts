import {DataSourceDetail} from "./data-source-detail";

export interface AggregationJob {
  _id: string;
  type: 'scheduled' | 'manual';
  status: 'running' | 'finished';
  startedAt: Date;
  finishedAt?: Date;
  dataSourceDetails: DataSourceDetail[];
}
