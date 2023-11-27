import {
  memo, FC, useCallback,
} from 'react';
import cn from 'classnames';
import { Theme } from '@/utils/types';
import { Box } from '../Box';
import { AccordionToggle } from './AccordionToggle';
import { AccordionProps } from './types';
import classes from './Accordion.module.scss';

export const Accordion: FC<AccordionProps> = memo(({
  children,
  icon,
  title,
  theme = Theme.dark,
  classNameWrap,
  classNameCollapse,
  classNameOpen,
  classNameToggleWrap,
  onSelect: onSelectProps = () => {},
  dataTestId = '',
  fullWidth = true,
  isOpen = false,
}) => {
  const onSelect: (isOpen: boolean) => void = useCallback((isOpen: boolean) => {
    onSelectProps(isOpen);
  }, [onSelectProps]);

  return (
    <Box
      direction="column"
      className={cn(
        classes.accordion,
        { [classes.fullWidth]: fullWidth, [cn(classes.open, classNameOpen || '')]: isOpen },
        classes[theme],
        classNameWrap,
      )}
      data-testid={`${dataTestId ? `${dataTestId}-` : dataTestId}accordion`}
    >
      <AccordionToggle
        {...{
          isOpen, title, icon, theme, onSelect, dataTestId, classNameWrap: classNameToggleWrap,
        }}
      />
      {isOpen && (
        <Box className={cn(classes.children, classNameCollapse)} direction="column">
          {children}
        </Box>
      )}
    </Box>
  );
});
