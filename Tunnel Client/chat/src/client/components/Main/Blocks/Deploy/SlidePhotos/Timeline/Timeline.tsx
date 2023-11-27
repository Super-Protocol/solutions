import { SyntheticEvent, useCallback, useMemo } from 'react';
import cn from 'classnames';

import { Box } from '@/ui/Box';
import { TimelineProps } from './types';
import classes from './Timeline.module.scss';

export const Timeline = ({ current, setDirection, width }: TimelineProps) => {
  const onClick = useCallback((e: SyntheticEvent, item: number) => {
    e.preventDefault();
    setDirection(item);
  }, [setDirection]);

  const boxStyle = useMemo(() => (width <= 770 ? { width: `${width / 3 - 30}px` } : undefined), [width]);

  return (
    <Box className={classes.wrap} justifyContent="center">
      <Box className={classes.lines}>
        {Array.from(Array(3).keys()).map((item) => (
          <div key={item} className={classes.box} onClick={(e) => onClick(e, item)} style={boxStyle}>
            <span className={classes.line} />
            {item === current && <span className={cn(classes.fill, classes.show)} />}
          </div>
        ))}
      </Box>
    </Box>
  );
};
