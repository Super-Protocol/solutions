import { useMemo, useCallback } from 'react';

import { Box } from '@/ui/Box';
import { Icon } from '@/ui/Icon';
import { getTwitterLink } from './helpers';
import classes from './Share.module.scss';

export const Share = () => {
  const href = useMemo(() => getTwitterLink(), []);
  const onClick = useCallback(() => {
    window.open(href, '_blank');
  }, [href]);

  return (
    <Box className={classes.content} alignItems="center" justifyContent="center">
      <Box>
        <Icon
          width={24}
          name="twitter"
          className={classes.icon}
        />
        <div className={classes.textGroup}>
          <span className={classes.text} onClick={onClick}>Share to Twitter</span>
        </div>
      </Box>
    </Box>
  );
};
