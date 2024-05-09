import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AiGeneratedImage} from "./models/ai-generated-image";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private readonly apiUrl = 'http://localhost:80'

  constructor(private http: HttpClient) {
  }

  searchImages(query: { [key: string]: string | string[] }): Observable<AiGeneratedImage[]> {
    const params = new HttpParams({fromObject: query});
    return this.http.get<AiGeneratedImage[]>(`${this.apiUrl}/content/images`, {params});
  }

  getImage(id: string): Observable<AiGeneratedImage> {
    return this.http.get<AiGeneratedImage>(`${this.apiUrl}/content/images/${id}`);
  }
}
