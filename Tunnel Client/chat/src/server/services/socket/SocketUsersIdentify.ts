export type UsersValue = { id: string; roomId: string; }

export class SocketUsersIdentify {
  public readonly users: Map<string, UsersValue>;
  constructor() {
    this.users = new Map();
  }
  public addUserBySocketId(socketId: string, value: UsersValue): SocketUsersIdentify {
    this.users.set(socketId, value);
    return this;
  }
  public getUserBySocketId(socketId: string): UsersValue | undefined {
    return this.users.get(socketId);
  }
  public getUserSocketId(id: string): string | undefined {
    return [...this.users.entries()].find(([, value]) => value?.id === id)?.[0];
  }
  public getUsersByRoomId(roomId: string): { socketId: string; id: string }[] {
    return [...this.users.entries()]
      .filter(([, value]) => value.roomId === roomId)
      .map(([socketId, value]) => ({ socketId, id: value.id }));
  }
  public getUsersByRooms(roomIds: string[]): { socketId: string; id: string }[] {
    return [...this.users.entries()]
      .filter(([, value]) => roomIds.includes(value.roomId))
      .map(([socketId, value]) => ({ socketId, id: value.id }));
  }
  public deleteUserBySocketId(socketId: string): boolean {
    this.users.delete(socketId);
    return true;
  }
  public deleteUsersBySocketId(socketIds: string[]): boolean {
    if (!socketIds?.length) return true;
    socketIds.map((socketId) => this.users.delete(socketId));
    return true;
  }
  public deleteUsersByRoomId(roomId: string): boolean {
    if (!roomId) return true;
    [...this.users.entries()].forEach(([socketId, value]) => {
      if (roomId === value.roomId) {
        this.users.delete(socketId);
      }
    });
    return true;
  }
  public getUsersGroupedByRooms(): { [roomId: string]: Set<string> } {
    if (!this.users.size) return {};
    return [...this.users.values()].reduce((acc, { roomId, id }) => {
      if (acc[roomId]) {
        acc[roomId].add(id);
      } else {
        acc[roomId] = new Set([id]);
      }
      return acc;
    }, {} as { [roomId: string]: Set<string> });
  }
  public getRooms(): string[] {
    if (this.users.size) return [];
    const set = [...this.users.values()].reduce((acc, { roomId }) => {
      acc.add(roomId);
      return acc;
    }, new Set<string>());
    return [...set];
  }
  public clear(): boolean {
    this.users.clear();
    return true;
  }
}