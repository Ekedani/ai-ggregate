import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AiGeneratedImage} from "./interfaces/ai-generated-image";
import {BehaviorSubject, Observable, tap} from "rxjs";
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

  constructor(private http: HttpClient) {
  }

  searchImages(query: { [key: string]: string | string[] }): Observable<{
    page: number,
    total: number,
    images: AiGeneratedImage[]
  }> {
    this.searchQuery = query;
    const params = new HttpParams({fromObject: {...query, page: '1', limit: '100'}});
    return this.http.get<{
      page: number,
      total: number,
      images: AiGeneratedImage[]
    }>(`${this.apiUrl}/content/images`, {params})
      .pipe(tap({
        next: (data) => {
          const galleryImages = this.convertToGalleryImages(data.images);
          this.galleryImagesSubject.next(galleryImages);
          this.paginationDataSubject.next({page: data.page, total: data.total});
        }
      }));
  }

  getNewPage(page: number): Observable<{
    page: number,
    total: number,
    images: AiGeneratedImage[]
  }> {
    const params = new HttpParams({fromObject: {...this.searchQuery, page: page.toString(), limit: '100'}});
    return this.http.get<{
      page: number,
      total: number,
      images: AiGeneratedImage[]
    }>(`${this.apiUrl}/content/images`, {params})
      .pipe(tap({
        next: (data) => {
          const galleryImages = this.convertToGalleryImages(data.images);
          this.galleryImagesSubject.next(galleryImages);
          this.paginationDataSubject.next({page: data.page, total: data.total});
        }
      }));
  }

  getImage(id: string): Observable<AiGeneratedImage> {
    return this.http.get<AiGeneratedImage>(`${this.apiUrl}/content/images/${id}`);
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

  getImageUrl(image: AiGeneratedImage) {
    return `${this.apiUrl}/content/storage/images/${image.storageKey}`;
  }
}
