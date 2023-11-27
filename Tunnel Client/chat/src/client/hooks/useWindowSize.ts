import { useEffect, useState } from 'react';
import { isSSR } from '../../common/utils';

export type Dim = {
  height: number;
  width: number;
}

const init = {
  width: 0,
  height: 0,
};

export const useWindowSize = (): Dim => {
  const [dim, setDim] = useState(init);

  useEffect(() => {
    if (isSSR()) return;
    const updateSize = () => {
      setDim((prev) => ({
        ...prev,
        height: window.innerHeight,
        width: window.innerWidth,
      }));
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return dim;
};
