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

    constructor(id: number, status: string, maxPlayers: number, createdAt: Date, gameCode: string) {
        this.id = id;
        this.status = status;
        this.maxPlayers = maxPlayers;
        this.createdAt = createdAt;
        this.gameCode = gameCode;
    }
}
    
@Injectable({
    providedIn: 'root'
})
export class joinRoomService {
    private baseUrl = 'http://localhost:8200/game-session';

    constructor(private http: HttpClient) { }
    joinRoom(roomCode: string): any {
        return this.http.post(this.baseUrl + '/join?username=admin&gameCode=' + roomCode, {});
    }

    createRoom(): Observable<GameSession> {
        return this.http.post<GameSession>(this.baseUrl + '/create?username=admin', {});
    }
}