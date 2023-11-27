import {
  memo,
  useCallback,
  useState,
  SyntheticEvent,
  useEffect,
  createElement,
  useMemo,
  FormEvent,
  KeyboardEvent,
  forwardRef,
} from 'react';
import cn from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';
import InputMask from 'react-input-mask';
import { v1 as uuid } from 'uuid';
import { Theme } from '@/utils/types';
import { Spinner } from '../Spinner';
import { Notification } from '../Notification';
import { Box } from '../Box';
import classes from './InputUi.module.scss';
import { InputUiProps, keyCodes, Check } from './types';
import { InputCounter } from './InputCounter';
import useValidInputRange from './hooks/useValidInputRange';

export const InputUi = memo(forwardRef<HTMLInputElement, InputUiProps>(({
  id,
  label = '',
  value,
  isNumber = false,
  isFloat = false,
  isPositive = false,
  isInvalid = false,
  disabled,
  min,
  max,
  error,
  prepend,
  append,
  showError = false,
  showInvalid = false,
  showInvalidRange = false,
  autoComplete = 'off',
  classNameWrap,
  classNameLabel,
  classNameInput,
  classNameErrorEmpty,
  classNameError,
  classNamePrepend,
  classNameAppend,
  classNameInputLabelFocused,
  classNameInputLabel,
  onChange: onChangeProps = (): void => {},
  onKeyDown = (): void => {},
  onBlur = (): void => {},
  onFocus = (): void => {},
  loading = false,
  as,
  resize = 'none',
  autosize = false,
  // пропсы для инпута типа "mask"
  mask,
  alwaysShowMask,
  beforeMaskedStateChange,
  renderError,
  emptyError = false,
  theme = Theme.dark,
  showCounter,
  isValidateRange: isValidateRangeProp = false,
  ...props
}, ref) => {
  const isValidateRange = useMemo(
    () => isValidateRangeProp && (max !== undefined || min !== undefined),
    [isValidateRangeProp, max, min],
  );
  const { isValid: isValidRange, onChangeIsValid } = useValidInputRange();
  const [inputId] = useState<string>(id || uuid());
  const [focused, setFocused] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<string>(value ? `${value}` : '');

  const onChange = useCallback(
    (value: string | number | undefined, e?: SyntheticEvent, check?: boolean) => {
      onChangeProps?.(value, e, check);
      if (isValidateRange) {
        onChangeIsValid(check || false);
      }
    },
    [onChangeProps, onChangeIsValid, isValidateRange],
  );

  const checkMin = useCallback(
    ({ val, check = true }: Check) => {
      return min !== undefined && val as number < min ? { val: min, check: false } : { val, check: check && true };
    },
    [min],
  );
  const checkMax = useCallback(
    ({ val, check = true }: Check) => {
      if (max !== undefined) {
        if (isFloat || isNumber) {
          return val as number > max ? { val: max, check: false } : { val, check: check && true };
        }
        return (val as string).length <= max ? { val, check: check && true } : { val: `${val}`.substr(0, max), check: false };
      }
      return { val, check: true };
    },
    [max, isFloat, isNumber],
  );
  const checkMinMax = useCallback(
    ({ val, check = true }: Check) => checkMax(checkMin({ val, check })),
    [checkMax, checkMin],
  );

  const getCheckedValue = useCallback((val: string | number | undefined): Check => {
    if (!val && val !== 0) return isNumber || isFloat ? { val: undefined } : val === null ? { val } : { val: '' };
    if (isPositive && (isNumber || isFloat) && val as number < 0) return { val: undefined };
    return checkMinMax({ val });
  }, [isNumber, isFloat, isPositive, checkMinMax]);

  const handleBlur: (evt: FormEvent<EventTarget>) => void = useCallback((evt: React.FormEvent<EventTarget>) => {
    setFocused(false);
    onBlur(evt);
    if (isFloat && localValue) {
      const parsedValue: number = parseFloat(localValue);
      setLocalValue(!Number.isNaN(parsedValue) ? `${parsedValue}` : '');
    }
  }, [isFloat, localValue, onBlur]);

  const handleFocus: (evt: FormEvent<EventTarget>) => void = useCallback((evt: React.FormEvent<EventTarget>) => {
    setFocused(true);
    onFocus(evt);
  }, [onFocus]);

  const handleChangeFloat: (evt: SyntheticEvent) => void = useCallback((evt: SyntheticEvent) => {
    const { val, check } = checkMinMax({ val: ((evt.target as HTMLInputElement).value || '').replace(/,/g, '.') });
    const valStr = `${val}`;
    const parsedValue: number = parseFloat(valStr);
    const re = /^\d+(\.(\d+)?)/;
    if (re.test(valStr)) {
      setLocalValue(valStr.match(re)?.[0] || '');
    } else if (!isPositive && (valStr === '-' || /[-]\d+$|[-]\d+\.$/.test(valStr))) {
      setLocalValue(`${valStr}`);
    } else {
      setLocalValue(!Number.isNaN(parsedValue) ? `${parsedValue}` : '');
    }
    onChange(!Number.isNaN(parsedValue) ? parsedValue : undefined, evt, check);
  }, [onChange, isPositive, checkMinMax]);

  const handleChangeNumber: (evt: SyntheticEvent) => void = useCallback((evt: SyntheticEvent) => {
    const { val, check } = checkMinMax({ val: (evt.target as HTMLInputElement).value });
    const valStr = `${val}`;
    const parsedValue: number = parseInt(valStr, 10);
    if (!isPositive && (valStr === '-' || /[-]\d+$/.test(valStr))) {
      setLocalValue(`${valStr}`);
    } else {
      setLocalValue(!Number.isNaN(parsedValue) ? `${parsedValue}` : '');
    }
    onChange(!Number.isNaN(parsedValue) ? parsedValue : undefined, evt, check);
  }, [onChange, isPositive, checkMinMax]);

  const handleChangeText: (evt: SyntheticEvent) => void = useCallback((evt: SyntheticEvent) => {
    const { val, check } = checkMinMax({ val: (evt.target as HTMLInputElement).value });
    const valStr = `${val}`;
    setLocalValue(valStr);
    onChange(valStr, evt, check);
  }, [onChange, checkMinMax]);

  const handleChange: (evt: SyntheticEvent) => void = useCallback((evt: SyntheticEvent) => {
    if (isNumber) {
      return handleChangeNumber(evt);
    }
    if (isFloat) {
      return handleChangeFloat(evt);
    }
    return handleChangeText(evt);
  }, [isNumber, isFloat, handleChangeText, handleChangeFloat, handleChangeNumber]);

  const handleKeyDown: (evt: SyntheticEvent) => void = useCallback((evt: SyntheticEvent) => {
    const val: string = (evt.target as HTMLInputElement).value;
    onKeyDown(evt);
    if (isNumber || isFloat) {
      const keyCode: number = (evt as KeyboardEvent).keyCode || (evt as React.KeyboardEvent).which;
      if (keyCode && [keyCodes.ARROW_UP, keyCodes.ARROW_DOWN].includes(keyCode)) {
        const decimalAfterPoint: number = val?.split('.')?.[1]?.length || 0;
        const incremented: string = (+val + (keyCode === keyCodes.ARROW_UP ? 1 : -1)).toFixed(decimalAfterPoint);
        const { val: newValue, check } = checkMinMax({ val: isFloat ? parseFloat(incremented) : parseInt(incremented, 10) });
        if ((newValue && newValue as number > 0) || !isPositive) {
          setLocalValue(!Number.isNaN(newValue) ? `${newValue}` : '');
          onChange(!Number.isNaN(newValue) ? newValue : undefined, evt, check);
        }
      }
    }
  }, [isNumber, isFloat, isPositive, onKeyDown, onChange, checkMinMax]);

  const inputAs = useMemo(() => {
    if (as === 'textarea') {
      if (autosize) {
        return TextareaAutosize;
      }

      return 'textarea';
    }

    if (mask) {
      return InputMask;
    }

    return 'input';
  }, [as, autosize, mask]);

  const InputElement = createElement(
    (inputAs as any), // todo
    {
      ref,
      'data-testid': 'input',
      id: inputId,
      value: localValue,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      onFocus: handleFocus,
      className: cn(
        classes.input,
        {
          [classes.textarea]: as === 'textarea',
          [classes.disabled]: disabled,
        },
        classNameInput,
      ),
      style: as === 'textarea' && resize ? { resize } : undefined,
      autoComplete,
      disabled: disabled || loading,
      mask,
      ...(mask ? { alwaysShowMask, beforeMaskedStateChange } : {}),
      ...props,
    },
  );

  useEffect(() => {
    const { val: checkedValue } = getCheckedValue(value);
    if (checkedValue !== value && value !== undefined) {
      onChange(checkedValue);
    }
    if (
      (isFloat && parseFloat(value as string) !== parseFloat(localValue))
            || (isNumber && parseInt(value as string, 10) !== parseInt(localValue, 10))
    ) {
      const val: number = isFloat ? parseFloat(checkedValue as string) : parseInt(checkedValue as string, 10);
      setLocalValue(!Number.isNaN(val) ? `${val}` : '');
    } else if (!isNumber && !isFloat && checkedValue !== localValue) {
      setLocalValue(checkedValue ? `${checkedValue}` : '');
    } else if (checkedValue !== localValue && checkedValue === value && isNumber) {
      setLocalValue(`${checkedValue}`);
    }
  }, [value, isFloat, localValue, isNumber, getCheckedValue, isPositive, onChange]);

  const prependMemo = useMemo(() => prepend?.({ focused }), [prepend, focused]);
  const appendMemo = useMemo(() => append?.({ focused }), [append, focused]);
  const inValid = (showInvalid && isInvalid) || (showInvalidRange && (isValidateRange && !isValidRange));

  return (
    <div className={
      cn(
        classes.wrap,
        classNameWrap,
        classes[theme],
        { [classes.invalid]: inValid },
      )
    }
    >
      {!!label && (
        <div
          className={cn(classes.label, classNameLabel)}
          data-testid="input-label"
        >
          {label}
          {/* {tooltip && <Tooltip tooltip={tooltip} />} */}
        </div>
      )}
      <label
        data-testid="input-label-for"
        htmlFor={inputId}
        className={
          cn(
            classes.inputWrap,
            classNameInputLabel,
            {
              [classes.inputLabelFocused]: focused,
              [classNameInputLabelFocused || '']: focused,
            },
          )
        }
      >
        {
          !!prepend && (
            <Box
              className={cn(classes.prepend, classNamePrepend)}
              data-testid="input-prepend"
            >
              {prependMemo}
            </Box>
          )
        }
        {InputElement}
        {
          !!append && (
            <Box
              className={cn(classes.preappendpend, classNameAppend)}
              data-testid="input-append"
            >
              {appendMemo}
            </Box>
          )
        }
        {showCounter && max && <InputCounter inValid={inValid} count={localValue?.length || 0} max={max} />}
        {loading && <Spinner fullscreen classNameWrap={classes.loading} />}
      </label>
      {showError && (isInvalid && error ? (
        renderError
          ? renderError(error)
          : <Notification variant="error" className={cn(classes.error, classNameError)}>{error}</Notification>
      ) : (
        emptyError && <div data-testid="input-error-empty" className={cn(classes.errorEmpty, classNameErrorEmpty)} />
      ))}
    </div>
  );
}));
