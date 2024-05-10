import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AggregatedImagesService {
  private readonly apiUrl = 'http://localhost:80';

  constructor(
    private http: HttpClient,
  ) {
  }

  getAggregatedImages(pageIndex: number, pageSize: number) {
    return this.http.get<{
      page: number,
      total: number,
      images: any[]
    }>(`${this.apiUrl}/aggregation/images`, {
      params: {
        page: pageIndex.toString(),
        limit: pageSize.toString()
      }
    });
  }

  approveImages(imageIds: string[]) {
    return this.http.post(`${this.apiUrl}/aggregation/images/approve`, {imageIds});
  }

  rejectImages(imageIds: string[]) {
    return this.http.post(`${this.apiUrl}/aggregation/images/reject`, {imageIds});
  }

  cancelModeration(imageIds: string[]) {
    return this.http.post(`${this.apiUrl}/aggregation/images/cancel`, {imageIds});
  }
}
