import cn from 'classnames';
import classes from './Burger.module.scss';

import { BurgerProps } from './types';

export const Burger = ({ theme, onClick }: BurgerProps) => {
  return (
    <div className={classes.wrap} onClick={onClick}>
      <div className={classes.content}>
        <span className={cn(classes.line, classes[theme])} />
      </div>
    </div>
  );
};
