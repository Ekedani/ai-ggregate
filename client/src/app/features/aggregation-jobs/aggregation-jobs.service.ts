import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AggregationJob} from "./interfaces/aggregation-job";

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private readonly apiUrl = 'http://localhost:80';

  constructor(private http: HttpClient) {
  }

  getJobs(page: number, status?: string) {
    let params = new HttpParams({
      fromObject: {
        page: page.toString(),
        limit: '100',
      }
    });
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<{
      page: number,
      total: number,
      jobs: AggregationJob[]
    }>(`${this.apiUrl}/aggregation/jobs`, {params});
  }

  createJob(selectedProviders: string[]) {
    return this.http.post(`${this.apiUrl}/aggregation/jobs`, {imageProviders: selectedProviders});
  }
}
