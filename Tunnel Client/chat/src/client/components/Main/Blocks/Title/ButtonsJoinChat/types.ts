export interface ButtonsJoinChatProps {
  onOpenCreateNewRoom: () => void;
  onOpenConnectToRoom: (mode: boolean) => void;
  checkExpired: number;
}
