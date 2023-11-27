import {
  memo, useRef, useEffect, useCallback, useState, useMemo, useImperativeHandle, forwardRef,
} from 'react';

import { Box } from '../Box';
import type { SliderProps } from './types';
import classes from './Slider.module.scss';
import { transitionStyle } from './helpers';

export const Slider = memo(forwardRef<any, SliderProps>(({ data, slideWidth, slideHeight }, ref) => {
  const trackRef = useRef<any>(null);
  const [slide, setSlide] = useState<string>('');
  const [transition, setTransition] = useState(false);

  const initStyles = useCallback(() => {
    const slides: any[] = Array.from(trackRef.current?.children);
    slides.forEach((slide, idx) => {
      slide.style.left = `${slideWidth * (idx - 1)}px`;
    });
  }, [slideWidth]);

  useEffect(() => {
    if (!trackRef) return;
    initStyles();
  }, [initStyles]);

  const initWrapperStyles = useCallback((transform: string, transition?: string) => {
    trackRef.current.style.transform = transform;
    trackRef.current.style.transition = transition || transitionStyle;
  }, []);

  const onClickNext = useCallback(() => {
    initWrapperStyles(`translateX(-${slideWidth}px)`);
    setSlide('next');
    setTransition(true);
  }, [slideWidth, initWrapperStyles]);

  const onClickPrev = useCallback(() => {
    initWrapperStyles(`translateX(${slideWidth}px)`);
    setSlide('prev');
    setTransition(true);
  }, [slideWidth, initWrapperStyles]);

  useImperativeHandle(ref, () => ({
    clickNext() {
      if (!transition) {
        onClickNext();
      }
    },
    clickPrev() {
      if (!transition) {
        onClickPrev();
      }
    },
  }), [onClickNext, onClickPrev, transition]);

  const refresh = useCallback(() => {
    initStyles();
    initWrapperStyles('translateX(0)', 'none');
    setSlide('');
  }, [initStyles, initWrapperStyles]);

  const onTransitionEnd = useCallback((e: any) => {
    if (e.target !== trackRef.current || !slide) return;
    setTransition(false);
    const lastChild = trackRef?.current?.lastChild;
    const firstChild = trackRef?.current?.firstChild;
    if (slide === 'prev') {
      trackRef?.current?.insertBefore(lastChild, firstChild);
    }
    if (slide === 'next') {
      trackRef?.current?.appendChild(firstChild);
    }
    refresh();
  }, [refresh, slide]);

  const styleTrack = useMemo(() => ({ height: `${slideHeight}px` }), [slideHeight]);
  const styleContainer = useMemo(() => ({ width: `${slideWidth}px` }), [slideWidth]);

  return (
    <Box className={classes.container} justifyContent="center" style={styleContainer}>
      <Box
        className={classes.track}
        ref={trackRef}
        onTransitionEnd={onTransitionEnd}
        style={styleTrack}
      >
        {data}
      </Box>
    </Box>
  );
}));
