import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AiGeneratedImage} from "../models/ai-generated-image";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private apiUrl = 'http://localhost:80'

  constructor(private http: HttpClient) {
  }

  searchImages(query: {
    page: number,
    limit: number,
    prompt?: string,
    negativePrompt?: string,
    model?: string,
    createdAfter?: string,
    createdBefore?: string,
    provider?: string,
    format?: string,
    contentTags?: string[],
    technicalTags?: string[],
  }): Observable<AiGeneratedImage[]> {
    const params = new HttpParams({fromObject: query});
    return this.http.get<AiGeneratedImage[]>(`${this.apiUrl}/content/images`, {params});
  }


}