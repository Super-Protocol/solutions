import {
  memo,
  FC,
  useMemo,
  cloneElement,
  ReactNode,
  useCallback,
} from 'react';
import cn from 'classnames';
import { Theme } from '@/utils/types';
import { Box } from '@/ui/Box';
import { Icon } from '@/ui/Icon';
import { AccordionToggleProps } from './types';
import classes from './AccordionToggle.module.scss';

export const AccordionToggle: FC<AccordionToggleProps> = memo(({
  onSelect,
  isOpen,
  title,
  icon,
  theme = Theme.dark,
  dataTestId = '',
  classNameWrap,
}) => {
  const onClick = useCallback(() => onSelect(!isOpen), [onSelect, isOpen]);

  const iconWithFill: ReactNode = useMemo(
    () => !!icon && cloneElement(
      icon,
      {
        className: cn(classes.icon, icon?.props?.className),
        'data-testid': `${dataTestId ? `${dataTestId}-` : dataTestId}accordion-toggle-icon`,
      },
    ),
    [icon, dataTestId],
  );

  const dataTestIdIcon = useMemo(
    () => {
      const hasdataTestId = dataTestId ? `${dataTestId}-` : dataTestId;
      return `${hasdataTestId}accordion-toggle-${isOpen ? 'defis' : 'plus'}`;
    },
    [isOpen, dataTestId],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="accordion-toggle-btn"
      className={cn(classes.btn, classes[theme], { [classes.open]: isOpen }, classNameWrap)}
    >
      <div className={classes.inner}>
        <div className={classes.left}>
          {!!iconWithFill && <Box alignItems="center" className={classes.iconWrap}>{iconWithFill}</Box>}
          <div className={classes.title}>{title}</div>
        </div>
        <div className={classes.right}>
          <Icon
            name="arrow"
            className={classes.icon}
            width={10}
            data-testid={dataTestIdIcon}
          />
        </div>
      </div>
    </button>
  );
});
