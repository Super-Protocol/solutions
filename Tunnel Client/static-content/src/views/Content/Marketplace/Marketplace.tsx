import { Box, Link } from '@/ui';
import { SlidePhotos } from './SlidePhotos';
import classes from './Marketplace.module.scss';
import {
  list, line, title, footer,
} from './helpers';

export const Marketplace = () => (
  <Box alignItems="center" className={classes.content}>
    <Box direction="column" className={classes.describe}>
      <div className={classes.title}>{title}</div>
      <div className={classes.line}>{line}</div>
      <ul className={classes.ul}>
        {list.map(({ bold, text }, idx) => (
          <li key={idx} className={classes.li}>
            <span className={classes.bold}>{bold}</span>
              &nbsp;-&nbsp;
            {text}
          </li>
        ))}
      </ul>
      <Link href={footer.href}>
        <div className={classes.footer}>{footer.text}</div>
      </Link>
    </Box>
    <SlidePhotos />
  </Box>
);
