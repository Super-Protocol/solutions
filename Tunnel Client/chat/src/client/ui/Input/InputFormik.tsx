import {
  memo,
  forwardRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useField } from 'formik';
import { useDebouncedCallback } from 'use-debounce';
import { InputUi } from './InputUi';
import { InputFormikProps } from './types';

const DEFAULT_DEBOUNCE = 100;

export const InputFormik = memo(forwardRef<HTMLInputElement, InputFormikProps>(({
  name,
  debounceInterval = DEFAULT_DEBOUNCE,
  checkTouched = true,
  showError = true,
  showInvalid = true,
  showInvalidRange = true,
  isInvalid: isInvalidProps = false,
  onChange: onChangeProps = () => {},
  ...props
}, ref) => {
  const [, { value, error, touched }, { setValue, setTouched }] = useField(name);
  const [localValue, setLocalValue] = useState(value);
  const isInvalid: boolean = useMemo(
    () => !!(error && (!checkTouched || touched)) || !!isInvalidProps,
    [error, touched, checkTouched, isInvalidProps],
  );
  const setFormValue = useCallback((val: number | string, event: KeyboardEvent, check: boolean) => {
    setValue(val);
    onChangeProps(val, event, check);
  }, [onChangeProps, setValue]);
  const debouncedCallback = useDebouncedCallback(setFormValue, debounceInterval || DEFAULT_DEBOUNCE, { leading: true });
  const onChange = useCallback((val: number | string, event: KeyboardEvent, check: boolean) => {
    setLocalValue(val);
    if (debounceInterval === null) {
      setFormValue(val, event, check);
    } else {
      debouncedCallback(val, event, check);
    }
  }, [debouncedCallback, debounceInterval, setFormValue]);
  const onBlur = useCallback(() => setTouched(true), [setTouched]);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <InputUi
      {...props}
      ref={ref}
      showInvalidRange={showInvalidRange}
      showInvalid={showInvalid}
      name={name}
      value={localValue}
      error={error}
      showError={showError}
      isInvalid={isInvalid}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}));
