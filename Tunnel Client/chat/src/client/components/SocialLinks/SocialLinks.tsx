import { memo, FC } from 'react';
import { Box } from '@/ui/Box';
import { SocialLinksProps } from './types';
import { SocialLink } from './SocialLink/SocialLink';
import { list } from './helpers';

export const SocialLinks: FC<SocialLinksProps> = memo(({ className }) => {
  return (
    <Box className={className}>
      {list.map((item, index) => <SocialLink key={index} icon={item.icon} href={item.href} />)}
    </Box>
  );
});