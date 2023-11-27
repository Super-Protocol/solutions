import cn from 'classnames';
import { memo, FC } from 'react';
import { Button } from '@/ui/Buttons/Button';
import { Icon } from '@/ui/Icon';
import { SocialLinkProps } from './types';
import classes from './SocialLink.module.scss';

export const SocialLink: FC<SocialLinkProps> = memo(({ href, icon, className }) => {
  return (
    <Button variant="base-link" target="_blank" href={href} className={cn(classes.link, className)}>
      <Icon
        width={24}
        name={icon}
        className={classes.icon}
      />
    </Button>
  );
});