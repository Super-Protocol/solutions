export interface Token {
  createdAt: string;
  roomName: string;
  userName: string;
  connectPassword: string;
  exp?: number;
 }