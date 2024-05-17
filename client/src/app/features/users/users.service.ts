import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "./interfaces/user";
import {BehaviorSubject, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersBehaviorSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersBehaviorSubject.asObservable();

  apiUrl = 'http://localhost:80';

  constructor(private readonly httpClient: HttpClient) {
  }

  getUsers() {
    return this.httpClient.get<{ users: User[] }>(`${this.apiUrl}/users`).pipe(
      tap((data) => {
          this.usersBehaviorSubject.next(data.users)
        }
      )
    )
  }

  getUser(id: string | null) {
    return this.httpClient.get<User>(`${this.apiUrl}/users/${id}`)
  }
}
