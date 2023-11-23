import { memo, useCallback } from 'react';
import copy from 'copy-to-clipboard';
import cn from 'classnames';
import { Icon } from '@/ui/Icon';
import { Button } from '@/ui/Buttons/Button';
import { CopyToClipboardProps } from './types';
import classes from './CopyToClipboard.module.scss';

export const CopyToClipboard = memo<CopyToClipboardProps>(({
  className, onCopy: onCopyProp, width = 18, iconName = 'copy', text,
}) => {
  const onCopy = useCallback(() => {
    if (onCopyProp) {
      onCopyProp?.();
    }
    if (text) {
      copy(text);
    }
  }, [onCopyProp, text]);

  return (
    <Button onClick={onCopy} variant="transparent" className={cn(classes.wrap, className)}>
      <Icon
        width={width}
        name={iconName}
        className={classes.icon}
      />
    </Button>
  );
});
