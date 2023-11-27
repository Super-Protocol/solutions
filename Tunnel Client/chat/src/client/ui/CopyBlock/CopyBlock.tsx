import { memo, FC } from 'react';
import cn from 'classnames';
import { CopyToClipboard } from '@/ui/CopyToClipboard';
import { Box } from '@/ui/Box';
import { CopyBlockProps } from './types';
import classes from './CopyBlock.module.scss';

export const CopyBlock: FC<CopyBlockProps> = memo(({
  text, title, className, classNameText, onCopy, children, copyText,
}) => {
  return (
    <Box direction="column" className={cn(classes.wrap, className)}>
      <Box justifyContent="space-between" alignItems="center" className={classes.inner}>
        <Box className={classes.title}>{title}</Box>
        <CopyToClipboard onCopy={onCopy} text={copyText} />
      </Box>
      {children}
      {!children && !!text && <Box className={cn(classes.text, classNameText)}>{text}</Box>}
    </Box>
  );
});