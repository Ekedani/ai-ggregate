import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AiGeneratedImage} from "./interfaces/ai-generated-image";
import {BehaviorSubject, catchError, Observable, tap, throwError} from "rxjs";
import {GalleryImage} from "./interfaces/gallery-image";

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private readonly apiUrl = 'http://localhost:80';
  private galleryImagesSubject = new BehaviorSubject<GalleryImage[]>([]);
  private paginationDataSubject = new BehaviorSubject<{ page: number, total: number }>({page: 1, total: 0});
  public galleryImages$ = this.galleryImagesSubject.asObservable();
  public paginationData$ = this.paginationDataSubject.asObservable();
  public searchQuery: { [key: string]: string | string[] } = {};

  constructor(private http: HttpClient) {}

  private fetchImages(params: { [key: string]: any }): Observable<{ page: number, total: number, images: AiGeneratedImage[] }> {
    const httpParams = new HttpParams({fromObject: params});
    return this.http.get<{ page: number, total: number, images: AiGeneratedImage[] }>(`${this.apiUrl}/content/images`, {params: httpParams})
      .pipe(
        tap(data => {
          this.galleryImagesSubject.next(this.convertToGalleryImages(data.images));
          this.paginationDataSubject.next({page: data.page, total: data.total});
        }),
      );
  }

  searchImages(query: { [key: string]: string | string[] }, limit: number = 100): Observable<any> {
    this.searchQuery = {...query, page: '1', limit: limit.toString()};
    return this.fetchImages(this.searchQuery);
  }

  getNewPage(page: number, limit: number = 100): Observable<any> {
    const queryParams = {...this.searchQuery, page: page.toString(), limit};
    return this.fetchImages(queryParams);
  }

  private convertToGalleryImages(images: AiGeneratedImage[]): GalleryImage[] {
    const storageUrl = `${this.apiUrl}/content/storage`;
    return images.map(image => ({
      id: image._id,
      prompt: image.prompt,
      author: image.author?.name,
      storageUrl: `${storageUrl}/images/${image.storageKey}`,
      thumbnailUrl: `${storageUrl}/thumbnails/${image.thumbnailKey}`
    }));
  }

  getImage(id: string): Observable<AiGeneratedImage> {
    return this.http.get<AiGeneratedImage>(`${this.apiUrl}/content/images/${id}`);
  }

  getImageUrl(image: AiGeneratedImage) {
    return `${this.apiUrl}/content/storage/images/${image.storageKey}`;
  }
}
