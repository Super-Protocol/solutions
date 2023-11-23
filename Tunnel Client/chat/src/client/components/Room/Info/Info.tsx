import { memo, FC } from 'react';
import { Box } from '@/ui/Box';
import { getDomainUrl } from '@/utils/utils';
import { CopyInvationBlock } from '@/components/CopyInvationBlock';
import { InfoAccordion } from '../InfoAccordion';
import { InfoProps } from './types';
import classses from './Info.module.scss';

export const Info: FC<InfoProps> = memo(({ className, roomName, connectPassword }) => {
  return (
    <Box direction="column" className={className}>
      <InfoAccordion className={classses.accordion} />
      <CopyInvationBlock
        connectPassword={connectPassword}
        domainUrl={getDomainUrl()}
        roomName={roomName}
      />
    </Box>
  );
});