import { useMemo } from 'react';
import cn from 'classnames';
import { genericMemo } from '@/utils/utils';
import { Box } from '@/ui/Box';
import { Theme } from '@/utils/types';
import { ToastBodyProps } from './types';
import { getTitle } from './helpers';
import classes from './ToastBody.module.scss';

function Component<TData>({
  content,
  type,
  theme = Theme.dark,
  ...args
}: ToastBodyProps<TData>) {
  const title = useMemo(() => getTitle(type), [type]);
  const renderContent = useMemo(() => {
    if (!content) return null;
    if (typeof content === 'function') return content(args);
    if (typeof content === 'string') return <div>{content}</div>;
    return content;
  }, [content, args]);
  return (
    <Box direction="column" className={cn(classes.wrap, classes[theme])}>
      <div>{title}</div>
      {renderContent}
    </Box>
  );
}

export const ToastBody = genericMemo(Component);
