import Link from 'next/link';

import { Box } from '@/ui/Box';
import {
  list, text, title, linksDoc,
} from './helpers';
import { SlidePhotos } from './SlidePhotos';
import classes from './Deploy.module.scss';

export const Deploy = () => {
  return (
    <Box className={classes.content}>
      <Box className={classes.left} direction="column">
        <div className={classes.title}>{title}</div>
        <div className={classes.text}>{text}</div>
        <ul className={classes.ul}>
          {list.map((item, idx) => (
            <li key={idx}>
              {item}
            </li>
          ))}
        </ul>
        {linksDoc.map(({ text, href }, idx) => (
          <Link
            key={idx}
            href={href}
            target="_blank"
            className={classes.link}
          >
            {text}
          </Link>
        ))}
      </Box>
      <Box className={classes.right}>
        <SlidePhotos />
      </Box>
    </Box>
  );
};
