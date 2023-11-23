import { useEffect, useRef, useState } from 'react';

const useBtnCounter = () => {
  const [count, setCount] = useState(5);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (count <= 0) return;
    timerRef.current = setTimeout(() => {
      setCount((count) => --count);
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [count]);

  return {
    count,
  };
};

export default useBtnCounter;