import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, tap} from "rxjs";
import {AggregatedImage} from "./interfaces/aggregated-image";

@Injectable({
  providedIn: 'root'
})
export class AggregatedImagesService {
  private aggregatedImagesBehaviorSubject = new BehaviorSubject<AggregatedImage[]>([]);
  private paginationDataSubject = new BehaviorSubject<{ page: number, total: number }>({page: 1, total: 0});

  private apiUrl = 'http://localhost:80';

  public aggregatedImages$ = this.aggregatedImagesBehaviorSubject.asObservable();
  public paginationData$ = this.paginationDataSubject.asObservable();

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
        limit: pageSize.toString(),
        status: 'pending'
      }
    }).pipe(
      tap(
        (response) => {
          this.aggregatedImagesBehaviorSubject.next(response.images);
          this.paginationDataSubject.next({page: response.page, total: response.total})
        }
      )
    );
  }

  approveImages(imageIds: string[]) {
    return this.http.put(`${this.apiUrl}/aggregation/images/approval`, {imageIds});
  }

  rejectImages(imageIds: string[]) {
    return this.http.put(`${this.apiUrl}/aggregation/images/rejection`, {imageIds});
  }

  cancelModeration(imageIds: string[]) {
    return this.http.put(`${this.apiUrl}/aggregation/images/cancel`, {imageIds});
  }
}
