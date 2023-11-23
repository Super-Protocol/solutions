import {
  memo,
  FC,
  useCallback,
  useState,
  useMemo,
  useRef,
  SyntheticEvent,
} from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Box } from '@/ui/Box';
import { Button } from '@/ui/Buttons/Button';
import { Spinner } from '@/ui/Spinner';
import { InputFormik } from '@/ui/Input';
import { createRoom } from '@/connectors/rooms';
import useToast from '@/hooks/useToast';
import { getConfig } from '@/utils/config';
import { FormValues, Fields, CreateNewRoomFormProps } from './types';
import { getValidationSchema, getInitialValues } from './helpers';
import classes from './CreateNewRoomForm.module.scss';

const config = getConfig();

export const CreateNewRoomForm: FC<CreateNewRoomFormProps> = memo(({ onCreateRoom }) => {
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
      const response = await createRoom(formValues[Fields.roomName]?.trim(), formValues[Fields.userName]);
      const { data, error } = await response.json();
      if (response.ok && data && !error) {
        onCreateRoom({ room: data, userName: formValues[Fields.userName] });
        resetForm({ values: getInitialValues() });
      } else {
        throw new Error(error || 'Unknown error');
      }
    } catch (e) {
      error((e as Error).message);
    }
    setLoading(false);
  }, [onCreateRoom, error]);

  const handleSubmitForm = useCallback((e: SyntheticEvent) => e.preventDefault(), []);

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
      <form onSubmit={handleSubmitForm}>
        <Box direction="column">
          {loading && (
            <Spinner fullscreen />
          )}
          <Box className={classes.title}>
            Create New Chat Room
          </Box>
          <Box direction="column">
            <InputFormik
              autoFocus
              placeholder="Room name"
              label="Enter Room Name"
              name={Fields.roomName}
              showCounter
              isValidateRange
              max={config.MAX_ROOM_NAME_SYMBOLS}
              classNameWrap={classes.inputWrap}
            />
            <InputFormik
              placeholder="User name"
              label="Enter User Name"
              name={Fields.userName}
              max={config.MAX_USER_NAME_SYMBOLS}
              showCounter
              isValidateRange
              classNameWrap={classes.inputWrapUserName}
            />
            <Button
              className={classes.btn}
              variant="base"
              onClick={onSubmit}
            >
              Create new room
            </Button>
          </Box>
        </Box>
      </form>
    </Formik>
  );
});
