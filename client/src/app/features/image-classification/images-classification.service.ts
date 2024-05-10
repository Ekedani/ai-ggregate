import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImagesClassificationService {
  private readonly apiUrl = 'http://localhost:80';

  constructor(
    private http: HttpClient
  ) {
  }

  classifyImage(model: string, imageForm: FormData) {
    return this.http.post(`${this.apiUrl}/classifiers/images/${model}/prediction`, imageForm);
  }
}
