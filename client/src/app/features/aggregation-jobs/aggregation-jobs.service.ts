import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AggregationJob} from "./interfaces/aggregation-job";

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private readonly apiUrl = 'http://localhost:80';

  constructor(private http: HttpClient) {
  }

  getJobs(page: number) {
    return this.http.get<{
      page: number,
      total: number,
      jobs: AggregationJob[]
    }>(`${this.apiUrl}/aggregation/jobs?page=${page}&limit=100`);
  }
}
