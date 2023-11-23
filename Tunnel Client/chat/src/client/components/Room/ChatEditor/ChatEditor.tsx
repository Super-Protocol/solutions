import {
  memo,
  FC,
  useCallback,
  useState,
  useMemo,
  useRef,
} from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import useToast from '@/hooks/useToast';
import { Box } from '@/ui/Box';
import { getConfig } from '@/utils/config';
import { Button } from '@/ui/Buttons/Button';
import { InputFormik } from '@/ui/Input';
import IconFly from '@/assets/fly.svg';
import { FormValues, Fields, ChatEditorProps } from './types';
import { getValidationSchema, getInitialValues } from './helpers';
import classes from './ChatEditor.module.scss';

const config = getConfig();

export const ChatEditor: FC<ChatEditorProps> = memo(({ onSendMessage, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { error } = useToast();
  const formRef = useRef<FormikProps<FormValues>>(null);
  const submitForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  }, []);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const validationSchema = useMemo(() => getValidationSchema(), []);
  const [initialValues] = useState<FormValues>(getInitialValues());
  const onSubmit = useCallback(async () => {
    inputRef.current?.focus();
    setIsValidating(true);
    submitForm();
  }, [submitForm]);

  const onSubmitForm = useCallback(async (
    formValues: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    setLoading(true);
    setIsValidating(true);
    try {
      if (formValues[Fields.message].length > config.MAX_MESSAGE_SYMBOLS) {
        throw new Error(`Must be max ${config.MAX_MESSAGE_SYMBOLS} symbols`);
      }
      onSendMessage?.(formValues[Fields.message].trim());
      resetForm({ values: getInitialValues() });
    } catch (e) {
      error((e as Error)?.message);
    }
    setLoading(false);
  }, [onSendMessage, error]);
  const onKeyDownSubmit = useCallback(() => {
    setIsValidating(true);
    submitForm();
  }, [submitForm]);
  const debouncedKeyDown = useDebouncedCallback(onKeyDownSubmit, 100);
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      debouncedKeyDown();
    }
  }, [debouncedKeyDown]);
  const append = useCallback(() => (
    <Button variant="base-link" onClick={onSubmit} disabled={loading} className={classes.btn} type="submit">
      <Image src={IconFly} width={20} height={20} className={classes.icon} alt="send" />
    </Button>
  ), [onSubmit, loading]);
  return (
    <Formik<FormValues>
      innerRef={formRef}
      enableReinitialize={false}
      validateOnChange={isValidating}
      validateOnBlur={false}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmitForm}
    >
      <Box className={className}>
        <InputFormik
          ref={inputRef}
          autoFocus
          debounceInterval={null}
          name={Fields.message}
          classNameInputLabel={classes.inputLabel}
          classNameInput={classes.input}
          classNameWrap={classes.inputWrap}
          classNameInputLabelFocused={classes.inputLabelFocused}
          showError={false}
          showInvalid={false}
          as="textarea"
          autosize
          isValidateRange
          max={config.MAX_MESSAGE_SYMBOLS}
          placeholder={`Write your message (max ${config.MAX_MESSAGE_SYMBOLS} symbols)`}
          disabled={loading}
          maxRows={6}
          onKeyDown={onKeyDown}
          append={append}
        />
      </Box>
    </Formik>
  );
});

export default ChatEditor;