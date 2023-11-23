import {
  useCallback, useMemo,
} from 'react';
import cn from 'classnames';
import {
  toast,
  ToastContent,
  ToastOptions,
  Id,
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Theme } from '@/utils/types';
import { Box } from '@/ui/Box';
import { Icon } from '@/ui/Icon';
import { ToastBody } from '../ToastBody';
import classes from '../Toast.module.scss';

export type Success<TData> = (content: ToastContent<TData>, options?: ToastOptions<{}> | undefined) => Id;
export type Error<TData> = (content: ToastContent<TData>, options?: ToastOptions<{}> | undefined) => Id

export interface ToastResult<TData> {
  success: Success<TData>;
  error: Error<TData>;
}

export const getCommonProps = (props: { theme: Theme }) => {
  const { theme } = props || {};
  return {
    position: toast.POSITION.BOTTOM_RIGHT,
    className: cn(classes[theme], classes.toastCommon),
    progressClassName: cn(classes[theme], classes.progress),
    autoClose: 5000,
    pauseOnHover: true,
  };
};

export function useToast<TData>(props: { theme: Theme }): ToastResult<TData> {
  const { theme } = useMemo(() => (props || {}), [props]);
  const success: Success<TData> = useCallback((content, options) => {
    return toast.success(
      (props) => <ToastBody<any> type="success" theme={theme} content={content} {...props} />,
      {
        ...getCommonProps({ theme }),
        icon: (
          <Box className={cn(classes[theme], classes.iconWrap, classes.iconSuccess)} alignItems="center" justifyContent="center">
            <Icon
              name="check_small"
              width={10}
              height={12}
              className={classes.icon}
            />
          </Box>
        ),
        ...options,
      },
    );
  }, [theme]);
  const error: Error<TData> = useCallback((content, options) => {
    return toast.error(
      (props) => <ToastBody<any> type="error" theme={theme} content={content} {...props} />,
      {
        ...getCommonProps({ theme }),
        icon: (
          <Box className={cn(classes[theme], classes.iconWrap, classes.iconError)} alignItems="center" justifyContent="center">
            <Icon
              name="close_small"
              width={10}
              className={classes.icon}
            />
          </Box>
        ),
        ...options,
      },
    );
  }, [theme]);

  return {
    success,
    error,
  };
}