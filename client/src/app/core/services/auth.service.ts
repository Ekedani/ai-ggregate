import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {jwtDecode} from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:80';
  private readonly isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private readonly userInfo$ = new BehaviorSubject<{
    username?: string;
    id?: string;
    roles?: string[]
  } | null>(this.decodeToken());


  constructor(
    private readonly http: HttpClient,
  ) {
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  getUserInfo() {
    return this.userInfo$.asObservable();
  }

  register(data: { username: string; password: string; email: string; firstName?: string; lastName?: string; }) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: { email: string, password: string }) {
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(tokens => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        this.isLoggedIn$.next(true);
        this.userInfo$.next(this.decodeToken());
      })
    );
  }

  refresh(refreshToken: string) {
    return this.http.post<{
      accessToken: string,
      refreshToken: string
    }>(`${this.apiUrl}/auth/refresh`, {refreshToken}).pipe(
      tap(updatedTokens => {
        localStorage.setItem('accessToken', updatedTokens.accessToken);
        localStorage.setItem('refreshToken', updatedTokens.refreshToken);
        this.userInfo$.next(this.decodeToken());
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.isLoggedIn$.next(false);
        this.userInfo$.next(null);
      })
    );
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  private decodeToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return {id: decoded.sub, username: decoded.username, roles: decoded.roles};
    } catch (error) {
      return null;
    }
  }


}
