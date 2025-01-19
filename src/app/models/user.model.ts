export class User {
  username: string;
  email: string;
  jwt: string | undefined;
  wins: number;
  draws: number;
  losses: number;
  

  constructor(username: string, email: string, wins: number, draws: number, losses: number, jwt?: string) {
    this.username = username;
    this.email = email;
    this.wins = wins;
    this.draws = draws;
    this.losses = losses;
    this.jwt = jwt;
  }
}