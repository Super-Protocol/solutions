export interface User {
  id: string;
  name: string;
}

export interface ChatMembersListProps {
  list: User[];
  className?: string;
}