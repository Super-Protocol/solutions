import { Box } from '@/ui';
import scheme from '@/assets/scheme.png';
import { title, lines } from './helpers';
import classes from './Scheme.module.scss';

export const Scheme = () => (
  <Box className={classes.content} alignItems="center" justifyContent="space-between">
    <img src={scheme} alt="" className={classes.img} />
    <Box direction="column" className={classes.group}>
      <div className={classes.title}>{title}</div>
      <Box direction="column">
        {lines.map((line, idx) => (
          <p key={idx} className={classes.line}>{line}</p>
        ))}
      </Box>
    </Box>
    <img src={scheme} alt="" className={classes.imgMobile} />
  </Box>
);
