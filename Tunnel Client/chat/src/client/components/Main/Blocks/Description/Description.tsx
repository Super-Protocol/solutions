import Link from 'next/link';
import cn from 'classnames';

import { Box } from '@/ui/Box';
import { Share } from './Share/Share';
import {
  content, contentLinkBoxes, gradients, radial,
} from './helpers';
import classes from './Description.module.scss';

export const Description = () => {
  return (
    <Box className={classes.content} direction="column" alignItems="center">
      <Box className={classes.textBoxes}>
        {content.map(({ title, text }) => (
          <Box direction="column" className={classes.textBox} key={title}>
            <span className={cn(classes.textTitle, classes.ma15)}>{title}</span>
            <div className={classes.text}>{text}</div>
          </Box>
        ))}
      </Box>
      <Share />
      <Box className={classes.linkBoxes}>
        {contentLinkBoxes.map((item, idx) => {
          const {
            href, hrefText, text, title,
          } = item;
          return (
            <div key={idx} className={cn(classes.wrap, classes[gradients[idx]])}>
              <Box className={cn(classes.box, classes[radial[idx]])} direction="column" key={title}>
                <span className={cn(classes.textTitle, classes.ma10)}>{title}</span>
                <div className={classes.text}>{text}</div>
                <Link
                  href={href}
                  target="_blank"
                  className={classes.link}
                >
                  {hrefText}
                </Link>
              </Box>
            </div>
          );
        })}
      </Box>
    </Box>
  );
};
