import { memo, useMemo } from 'react';

import { Box, Link } from '@/ui';
import { arrContent } from './helpers';
import { SocialProps, SocialIcons } from './types';

export const Social = memo(({ icons, className }: SocialProps) => {
  const content = useMemo(() => (
    icons
      ? arrContent.filter(({ id }) => !icons.includes(id as SocialIcons))
      : arrContent
  ), [icons]);

  return (
    <Box className={className} justifyContent="space-between" alignItems="center">
      {content.map(({ id, src, href }) => (
        <Link key={id} href={href}>
          <img src={src} alt="" />
        </Link>
      ))}
    </Box>
  );
});
