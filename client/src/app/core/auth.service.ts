import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs";
import {jwtDecode} from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:80';

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  register(data: { username: string; password: string; email: string; firstName?: string; lastName?: string; }) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: { email: string, password: string }) {
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(tokens => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
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
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
    );
  }


  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUserInfo(): { username?: string; id?: string, roles?: string[] } {
    const token = this.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return {id: decoded.sub, username: decoded.username, roles: decoded.roles};
      } catch (error) {
        return {};
      }
    }
    return {};
  }
}
