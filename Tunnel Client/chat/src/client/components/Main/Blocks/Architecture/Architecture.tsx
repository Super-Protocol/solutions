/* eslint-disable @next/next/no-img-element */
import { Box } from '@/ui/Box';
import { text, title } from './helpers';
import classes from './Architecture.module.scss';

export const Architecture = () => {
  return (
    <Box className={classes.content} direction="column">
      <div className={classes.title}>{title}</div>
      <div className={classes.text}>{text}</div>
      <Box justifyContent="center" className={classes.imgWrap}>
        <img
          src="/scheme.webp"
          alt=""
          className={classes.img}
        />
      </Box>
    </Box>
  );
};
