import {
  useMemo, useState, memo, useRef, useEffect, useCallback,
} from 'react';

import { Box } from '@/ui/Box';
import { Slider } from '@/ui/Slider';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Slide } from './Slide';
import { Timeline } from './Timeline';
import { getPhotos, INTERVAL_UPDATE } from './helpers';
import classes from './SlidePhotos.module.scss';

export const SlidePhotos = memo(() => {
  const { width } = useWindowSize();
  const interval = useRef<number | null>();
  const sliderRef = useRef<any | null>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideWidth, setSlideWidth] = useState(710);
  const [slideHeight, setSlideHeight] = useState(415);

  const sliderData = useMemo(() => (
    <>
      {getPhotos().map((src, key) => (
        <Slide {...{
          key, src, setSlideWidth, setSlideHeight, idx: key, width,
        }}
        />
      ))}
    </>
  ), [width]);

  const setDirection = useCallback((idx: number) => {
    setCurrentSlide((prev) => {
      if (prev === idx) return idx;
      if (((prev < idx && !(idx === 2 && prev === 0)) || (idx === 0 && prev === 2))) {
        sliderRef.current.clickNext();
        return idx;
      }
      sliderRef.current.clickPrev();
      return idx;
    });
  }, []);

  const intervalBalanceUpdate = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
    interval.current = window.setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.clickNext();
        setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
      }
    }, INTERVAL_UPDATE);
  }, []);

  useEffect(() => {
    intervalBalanceUpdate();
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [intervalBalanceUpdate]);

  return (
    <Box direction="column" className={classes.sliderGroup}>
      <div className={classes.wrap}>
        <Slider data={sliderData} {...{ slideHeight, slideWidth }} ref={sliderRef} />
      </div>
      <Timeline current={currentSlide} setDirection={setDirection} width={width} />
    </Box>
  );
});
