import { Box } from '@/ui';
import { content } from './helpers';
import classes from './Advantages.module.scss';

export const Advantages = () => (
  <Box className={classes.content}>
    {content.map(({ title, text }, idx) => (
      <Box key={idx} direction="column" className={classes.block}>
        <div className={classes.title}>{title}</div>
        <div className={classes.text}>{text}</div>
      </Box>
    ))}
  </Box>
);
