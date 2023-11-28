import bg from '@/assets/bg.png';
import shadow from '@/assets/shadow.png';
import { text } from './helpers';
import classes from './Main.module.scss';

export const Main = () => (
  <div className={classes.header}>
    <div className={classes.box}>
      <div className={classes.text}>
        {text}
      </div>
    </div>
    <div className={classes.imageBox}>
      <img src={bg} alt="" className={classes.image} />
    </div>
    <div className={classes.shadowBox}>
      <div className={classes.bg}>
        <img src={shadow} alt="" className={classes.shadow} />
      </div>
    </div>
  </div>
);
