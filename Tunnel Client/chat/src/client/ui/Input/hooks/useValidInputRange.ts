import {
  useState, useEffect, useRef, useCallback,
} from 'react';

const VALIDATE_TIMEOUT = 1000;

const useValidInputRange = () => {
  const [isValid, setIsValid] = useState(true);
  const [isValidRerender, setIsValidRerender] = useState<number | null>(null);
  const onChangeIsValid = useCallback((isValid: boolean) => {
    setIsValid(isValid);
    setIsValidRerender(isValid ? null : Math.random());
  }, []);
  const checkErrorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (checkErrorTimeout.current) clearTimeout(checkErrorTimeout.current);
    checkErrorTimeout.current = setTimeout(() => {
      setIsValid(true);
    }, VALIDATE_TIMEOUT);
    return () => {
      if (checkErrorTimeout.current) clearTimeout(checkErrorTimeout.current);
    };
  }, [isValidRerender]);

  return {
    isValid,
    onChangeIsValid,
  };
};

export default useValidInputRange;