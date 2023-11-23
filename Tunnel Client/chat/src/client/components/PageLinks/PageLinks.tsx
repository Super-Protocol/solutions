import { memo, FC } from 'react';
import cn from 'classnames';

import { Box } from '@/ui/Box';
import { PageLinksProps } from './types';
import { PageLink } from './PageLink/PageLink';
import classes from './PageLinks.module.scss';
import { list } from './helpers';

export const PageLinks: FC<PageLinksProps> = memo(({ className }) => {
  return (
    <Box className={className}>
      {list.map((item, index) => (
        <PageLink className={cn({ [classes.link]: list.length - 1 !== index })} key={index} title={item.title} href={item.href} />
      ))}
    </Box>
  );
});