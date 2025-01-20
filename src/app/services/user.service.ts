import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { backendUrl } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `http://34.28.70.201:8080/user`;
  public userInfo: User | null = null;
  constructor(private http: HttpClient) {
    const userData = sessionStorage.getItem('currentUser');
    if (userData) {
      const parsedData = JSON.parse(userData);
      this.userInfo = new User(
        parsedData.username,
        parsedData.email,
        parsedData.wins,
        parsedData.draws,
        parsedData.losses,
      );
    }
  }

  getUserProfile(): Observable<User> {
    if (this.userInfo) {
      return this.http.get<User>(
        `${this.baseUrl}?name=${this.userInfo.username}`,
      );
    } else {
      // it should never reach this point
      return this.http.get<User>(`${this.baseUrl}/1`);
    }
  }

  getLeaderboard(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  register(user: User) {
    return this.http.post(backendUrl.authService.register, user) as any;
  }
}
