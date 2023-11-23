import {
  memo, useCallback, FC, useMemo,
} from 'react';
import { Box } from '@/ui/Box';
import useToast from '@/hooks/useToast';
import { CopyBlock } from '@/ui/CopyBlock';
import { CopyInvationBlockProps } from './types';
import classes from './CopyInvationBlock.module.scss';
import { getUrl } from './helpers';

export const CopyInvationBlock: FC<CopyInvationBlockProps> = memo(({
  connectPassword, roomName, domainUrl, className, mode = 'one',
}) => {
  const { success } = useToast();
  const onCopy = useCallback(() => {
    success('Chat info copied');
  }, [success]);

  const copyText = useMemo(() => getUrl({ domainUrl, connectPassword, roomName }), [domainUrl, connectPassword, roomName]);

  if (mode === 'one') {
    return (
      <CopyBlock title="Chat URL" onCopy={onCopy} className={className} copyText={copyText}>
        <Box className={classes.text}>
          {domainUrl}
        </Box>
        <Box className={classes.title}>
          Password to Join:
        </Box>
        <Box className={classes.text}>
          {connectPassword}
        </Box>
      </CopyBlock>
    );
  }

  return (
    <CopyBlock className={className} title="Invitation to Join" copyText={copyText} onCopy={onCopy} />
  );
});
