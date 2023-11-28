import { SyntheticEvent } from 'react';

export interface BurderProps {
  className?: string;
  onClick: ((event: SyntheticEvent<Element, Event>) => void);
}
