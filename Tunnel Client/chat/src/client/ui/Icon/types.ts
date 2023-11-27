import { names } from './helpers';

export type Name = typeof names[number];

export interface IconProps {
  name: Name;
  width?: number;
  height?: number;
  className?: string;
  [x: string]: any;
}
