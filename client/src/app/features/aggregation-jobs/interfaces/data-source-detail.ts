export interface DataSourceDetail {
  contentType: 'image' | 'text';
  provider: string;
  fetched: number;
  inserted: number;
  status: 'running' | 'success' | 'failed';
}
