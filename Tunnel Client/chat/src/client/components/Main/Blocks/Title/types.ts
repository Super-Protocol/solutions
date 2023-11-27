export interface TitleProps {
  onOpenCreateNewRoom: () => void;
  onOpenConnectToRoom: (mode: boolean) => void;
  checkExpired: number;
}