import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { backendUrl } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `http://localhost:8200/user`;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/1`);
  }

  // TODO: change hardcoded variable to actual user data
  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/?name=admin`, user);
  }

  getLeaderboard(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  register(user: User) {
    return this.http.post(backendUrl.authService.register, user) as any;
  }
}
