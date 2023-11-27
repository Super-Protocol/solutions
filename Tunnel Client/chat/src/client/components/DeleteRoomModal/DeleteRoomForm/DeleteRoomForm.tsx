import {
  memo,
  FC,
  useCallback,
  useState,
  useMemo,
  useRef,
} from 'react';
import cn from 'classnames';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Box } from '@/ui/Box';
import { Attention } from '@/components/Attention';
import { Button } from '@/ui/Buttons/Button';
import { useMobile } from '@/contexts/MobileContext';
import { Spinner } from '@/ui/Spinner';
import { InputFormik } from '@/ui/Input';
import useToast from '@/hooks/useToast';
import useBtnCounter from '@/hooks/useBtnCounter';
import { deleteRoom as deleteRoomConnector } from '@/connectors/rooms';
import { FormValues, Fields, DeleteRoomFormProps } from './types';
import { getValidationSchema, getInitialValues } from './helpers';
import classes from './DeleteRoomForm.module.scss';

export const DeleteRoomForm: FC<DeleteRoomFormProps> = memo(({ onDeleteRoom }) => {
  const { count } = useBtnCounter();
  const { isMobile } = useMobile();
  const { error } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const validationSchema = useMemo(() => getValidationSchema(), []);
  const [initialValues] = useState<FormValues>(getInitialValues());
  const formRef = useRef<FormikProps<FormValues>>(null);
  const submitForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  }, []);
  const onSubmit = useCallback(async () => {
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
      const response = await deleteRoomConnector(formValues[Fields.password]?.trim());
      const { data, error } = await response.json();
      if (response.ok && data && !error) {
        resetForm({ values: getInitialValues() });
        await onDeleteRoom?.();
      } else {
        throw new Error(error || 'Unknown error');
      }
    } catch (e) {
      error((e as Error).message);
    }
    setLoading(false);
  }, [onDeleteRoom, error]);

  return (
    <Formik<FormValues>
      innerRef={formRef}
      validateOnChange={isValidating}
      validateOnBlur={false}
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={onSubmitForm}
    >
      <Box className={cn(classes.container, { [classes.containerMobile]: isMobile })}>
        <Box direction="column" alignItems="center" justifyContent="center" className={cn(classes.block, classes.blockAttention)}>
          <Box className={classes.attentionWrap}>
            <Attention
              // eslint-disable-next-line max-len
              text="By entering your Passphrase to Delete you agree that your chat room will be deleted and all conversation history will be destroyed."
              title="Attention!"
            />
          </Box>
        </Box>
        <Box direction="column" className={classes.block}>
          {loading && (
            <Spinner fullscreen />
          )}
          <Box className={classes.title}>
            Delete Chat Room
          </Box>
          <Box direction="column">
            <InputFormik
              placeholder="Enter your Passphrase to Delete"
              name={Fields.password}
              as="textarea"
              classNameInput={classes.input}
            />
          </Box>
          <Button
            className={classes.btn}
            variant="base"
            disabled={!!count}
            onClick={onSubmit}
          >
            Delete Room
            {!!count && <>&nbsp;(in {count} sec)</>}
          </Button>
        </Box>
      </Box>
    </Formik>
  );
});
