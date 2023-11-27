/* eslint-disable @next/next/no-img-element */
import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Box } from '@/ui/Box';
import {
  title, text, href, hrefGuide,
} from './helpers';
import { TitleProps } from './types';
import classes from './Title.module.scss';

const ButtonsJoinChat = dynamic(() => import('./ButtonsJoinChat/ButtonsJoinChat'), { ssr: false });

export const Title = (props: TitleProps) => {
  return (
    <Box className={classes.wrapper}>
      <Box className={classes.content}>
        <Box direction="column" className={classes.describe}>
          <div className={classes.title}>{title}</div>
          <Link
            href={href}
            target="_blank"
            className={cn(classes.linkImage, classes.link)}
          >
            <Image
              src="poweredby.svg"
              alt=""
              width={151}
              height={44}
            />
          </Link>
          <div className={classes.text}>{text}</div>
          <ButtonsJoinChat {...props} />
        </Box>
        <Image
          src="/chat_bg.webp"
          alt=""
          width={443}
          height={466}
        />
        <Link
          href={hrefGuide}
          target="_blank"
          className={cn(classes.linkGuideMobile, classes.link)}
        >
          Read chat guide
        </Link>
      </Box>
    </Box>
  );
};
