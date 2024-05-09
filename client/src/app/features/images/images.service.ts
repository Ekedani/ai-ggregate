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
  public galleryImages$ = this.galleryImagesSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  searchImages(query: { [key: string]: string | string[] }): Observable<{ page: number, images: AiGeneratedImage[] }> {
    const params = new HttpParams({fromObject: query});
    return this.http.get<{ page: number, images: AiGeneratedImage[] }>(`${this.apiUrl}/content/images`, {params})
      .pipe(tap({
        next: (data) => {
          const galleryImages = this.convertToGalleryImages(data.images);
          this.galleryImagesSubject.next(galleryImages);
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
