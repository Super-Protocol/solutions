import { useWindowSize } from './useWindowSize';

export const useIsMobile = (mobileWidth = 1000): boolean => {
  const { width } = useWindowSize();
  return width <= mobileWidth;
};