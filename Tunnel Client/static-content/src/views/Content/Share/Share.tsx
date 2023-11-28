import { useMemo, useCallback } from 'react';

import { Box } from '@/ui';
import twitter from '@/assets/twitter.svg';
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
        <img src={twitter} alt="" />
        <div className={classes.textGroup}>
          <span className={classes.text} onClick={onClick}>Share to Twitter</span>
        </div>
      </Box>
    </Box>
  );
};
