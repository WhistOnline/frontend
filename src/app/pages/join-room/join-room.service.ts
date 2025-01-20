import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

class GameSession {
  id: number;
  status: string;
  maxPlayers: number;
  createdAt: Date;
  gameCode: string;

  constructor(
    id: number,
    status: string,
    maxPlayers: number,
    createdAt: Date,
    gameCode: string,
  ) {
    this.id = id;
    this.status = status;
    this.maxPlayers = maxPlayers;
    this.createdAt = createdAt;
    this.gameCode = gameCode;
  }
}

@Injectable({
  providedIn: 'root',
})
export class joinRoomService {
  private baseUrl = 'http://34.28.70.201:8080/game-session';
  private currentUserName: string = '';
  private currentUserToken: string = '';
  constructor(private http: HttpClient) {
    const userInfo = sessionStorage.getItem('currentUser') || '';
    if (userInfo) {
      const parsedData = JSON.parse(userInfo);
      this.currentUserName = parsedData.username;
      this.currentUserToken = parsedData.token;
    }
  }
  joinRoom(roomCode: string): any {
    return this.http.post(
      `${this.baseUrl}/join?username=${this.currentUserName}&gameCode=${roomCode}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.currentUserToken}`,
        },
      },
    );
  }

  createRoom(): Observable<GameSession> {
    return this.http.post<GameSession>(
      this.baseUrl + `/create?username=${this.currentUserName}`,
      {},
    );
  }
}
