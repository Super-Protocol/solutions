import {
  memo, useMemo, useState, useCallback, FC, useRef, SyntheticEvent,
} from 'react';
import { Formik, FormikProps } from 'formik';
import { Box } from '@/ui/Box';
import { Button } from '@/ui/Buttons/Button';
import { InputFormik } from '@/ui/Input/InputFormik';
import { connectToRoom } from '@/connectors/rooms';
import { Spinner } from '@/ui/Spinner';
import useToast from '@/hooks/useToast';
import { getConfig } from '@/utils/config';
import {
  getValidationSchema,
  initialValues,
} from './helpers';
import { Fields, FormValues, ConnectToRoomFormProps } from './types';
import classes from './ConnectToRoomForm.module.scss';

const config = getConfig();

export const ConnectToRoomForm: FC<ConnectToRoomFormProps> = memo(({ onCreateRoom }) => {
  const { error } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const validationSchema = useMemo(() => getValidationSchema(), []);
  const formRef = useRef<FormikProps<FormValues>>(null);
  const submitForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  }, []);

  const onSubmitForm = useCallback(async (values: FormValues) => {
    try {
      setLoading(true);
      const { password = '', name } = values || {};
      if (!password) throw new Error('password required');
      if (!name) throw new Error('name required');
      const response = await connectToRoom(password, name);
      const { error } = await response.json();
      if (response.ok && !error) {
        onCreateRoom?.();
      } else {
        throw new Error(error || 'Unknown error');
      }
    } catch (e) {
      error((e as Error)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [error, onCreateRoom]);

  const onSubmit = useCallback(() => {
    setIsValidating(true);
    submitForm();
  }, [submitForm]);

  const handleSubmitForm = useCallback((e: SyntheticEvent) => e.preventDefault(), []);

  return (
    <Formik<FormValues>
      innerRef={formRef}
      validateOnChange={isValidating}
      validateOnBlur={isValidating}
      initialValues={initialValues}
      onSubmit={onSubmitForm}
      enableReinitialize
      validationSchema={validationSchema}
    >
      <form onSubmit={handleSubmitForm}>
        <Box direction="column">
          {loading && (
            <Spinner fullscreen />
          )}
          <Box className={classes.title}>Join Chat Room</Box>
          <Box direction="column" className={classes.wrapComponent}>
            <InputFormik
              autoFocus
              placeholder="User name"
              label="User Name"
              showCounter
              isValidateRange
              max={config.MAX_USER_NAME_SYMBOLS}
              name={Fields.name}
              classNameWrap={classes.inputWrap}
            />
            <InputFormik
              placeholder="Password"
              classNameWrap={classes.inputWrapPassword}
              label="Password"
              name={Fields.password}
              type="text"
            />
          </Box>
          <Button
            onClick={onSubmit}
            className={classes.button}
          >
            Join
          </Button>
        </Box>
      </form>
    </Formik>
  );
});
