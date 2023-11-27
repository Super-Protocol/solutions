import { Theme } from '@/utils/types';
import { Name } from '@/ui/Icon/types';

export interface CopyToClipboardProps {
  className?: string;
  theme?: Theme;
  onCopy?: () => void;
  width?: number;
  iconName?: Name;
  text?: string;
}