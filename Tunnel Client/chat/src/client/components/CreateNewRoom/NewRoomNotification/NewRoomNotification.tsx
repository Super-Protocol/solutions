import {
  memo, FC, useCallback, SyntheticEvent, useState, useMemo,
} from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { getDomainUrl } from '@/utils/utils';
import { useMobile } from '@/contexts/MobileContext';
import { Box } from '@/ui/Box';
import useToast from '@/hooks/useToast';
import useBtnCounter from '@/hooks/useBtnCounter';
import { Button } from '@/ui/Buttons/Button';
import { Attention } from '@/components/Attention';
import { CopyInvationBlock } from '@/components/CopyInvationBlock';
import { CopyBlock } from '@/ui/CopyBlock';
import { connectToRoom } from '@/connectors/rooms';
import { NewRoomNotificationProps } from './types';
import classes from './NewRoomNotification.module.scss';
import { getUrl } from './helpers';

export const NewRoomNotification: FC<NewRoomNotificationProps> = memo(({
  connectPassword, deletePassword, userName, roomName,
}) => {
  const { count } = useBtnCounter();
  const { isMobile } = useMobile();
  const { push } = useRouter();
  const { error, success } = useToast();
  const [loading, setLoading] = useState(false);
  const redirectToRoom = useCallback(async () => {
    try {
      setLoading(true);
      const response = await connectToRoom(connectPassword, userName);
      const { error } = await response.json();
      if (response.ok && !error) {
        push('/room');
      } else {
        throw new Error(error);
      }
    } catch (e) {
      error((e as Error)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [push, userName, connectPassword, error]);
  const onCopyDeletePassword = useCallback(() => {
    success('Your room delete phrase copied');
  }, [success]);
  const handleSubmitForm = useCallback((e: SyntheticEvent) => e.preventDefault(), []);
  const copyDeleteBlockText = useMemo(() => getUrl({
    connectPassword, domainUrl: getDomainUrl(), roomName, deletePassword,
  }), [connectPassword, roomName, deletePassword]);

  return (
    <form onSubmit={handleSubmitForm}>
      <Box className={cn(classes.container, { [classes.containerMobile]: isMobile })}>
        <Box direction="column" alignItems="center" justifyContent="center" className={cn(classes.block, classes.blockAttention)}>
          <Box className={classes.attentionWrap}>
            <Attention
              // eslint-disable-next-line max-len
              text="Please save the Passphrase to Delete. It will not be available after this step and there is no recovery! You will need this passphrase to irrevocably delete your chat room and all conversation history."
              title="Attention!"
            />
          </Box>
        </Box>
        <Box direction="column" className={classes.block}>
          <CopyInvationBlock
            connectPassword={connectPassword}
            domainUrl={getDomainUrl()}
            roomName={roomName}
            className={classes.copyInfo}
          />
          <CopyBlock
            copyText={copyDeleteBlockText}
            title="Passphrase to Delete"
            text={deletePassword}
            className={classes.block}
            onCopy={onCopyDeletePassword}
          />
          <Button
            className={classes.btn}
            disabled={loading || !!count}
            type="submit"
            onClick={redirectToRoom}
          >
            Start Chatting
            {!!count && <>&nbsp;(in {count} sec)</>}
          </Button>
        </Box>
      </Box>
    </form>
  );
});