import { memo, useState, FC } from 'react';
import cn from 'classnames';
import { Accordion } from '@/ui/Accordion';
import { Box } from '@/ui/Box';
import { intoList } from './helpers';
import classes from './InfoAccordion.module.scss';
import { InfoAccordionProps } from './types';

export const InfoAccordion: FC<InfoAccordionProps> = memo(({ className }) => {
  const [open, setOpen] = useState<string | null>();
  return (
    <Box direction="column" className={cn(classes.list, className)}>
      {intoList.map(({ title, content, eventKey }) => (
        <Accordion
          isOpen={open === eventKey}
          key={title}
          title={title}
          onSelect={() => setOpen(eventKey === open ? null : eventKey)}
        >
          {content}
        </Accordion>
      ))}
    </Box>
  );
});