import cn from 'classnames';

import { Box, Link } from '@/ui';
import { content, gradients, radial } from './helpers';
import classes from './Rewards.module.scss';

export const Rewards = () => (
  <Box className={classes.content} justifyContent="space-between">
    {content.map(({ title, text, footer }, idx) => (
      <div key={idx} className={cn(classes.wrap, classes[gradients[idx]])}>
        <Box className={cn(classes.box, classes[radial[idx]])} direction="column" justifyContent="space-between">
          <div>
            <div className={classes.title}>{title}</div>
            <div className={classes.text}>{text}</div>
          </div>
          <Link href={footer.href}>
            <div className={classes.footer}>{footer.text}</div>
          </Link>
        </Box>
      </div>
    ))}
  </Box>
);
