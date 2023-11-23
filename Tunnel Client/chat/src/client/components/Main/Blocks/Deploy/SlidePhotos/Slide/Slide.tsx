import {
  useRef, useEffect, memo, useMemo,
} from 'react';
import NextImage from 'next/image';
import { usePrevious } from '@/hooks/usePrevious';
import type { SlideProps } from './types';
import classes from './Slide.module.scss';

export const Slide = memo(({
  src, setSlideWidth, setSlideHeight, idx, width,
}: SlideProps) => {
  const refImage = useRef<any>(null);
  const prevWidth = usePrevious(width);

  useEffect(() => {
    if (idx !== 0) return;
    const imageLoader = new Image();
    imageLoader.src = src;

    imageLoader.onload = () => {
      const slideHeight = refImage?.current?.getBoundingClientRect().height;
      const slideWidth = refImage?.current?.getBoundingClientRect().width;
      setSlideHeight(slideHeight);
      setSlideWidth(slideWidth);
    };
  }, [src, setSlideHeight, setSlideWidth, idx]);

  useEffect(() => {
    if (prevWidth !== width) {
      const slideWidth = refImage?.current?.getBoundingClientRect().width;
      const slideHeight = refImage?.current?.getBoundingClientRect().height;
      setSlideWidth(slideWidth);
      setSlideHeight(slideHeight);
    }
  }, [setSlideWidth, setSlideHeight, width, prevWidth]);

  const imgStyle = useMemo(() => (width <= 770 ? { width: `${width - 60}px` } : undefined), [width]);

  return (
    <div className={classes.slide}>
      <NextImage
        src={src}
        alt=""
        width={711}
        height={415}
        className={classes.image}
        ref={refImage}
        style={imgStyle}
      />
    </div>
  );
});
