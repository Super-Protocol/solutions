import { Main } from './Main';
import { Advantages } from './Advantages';
import { Share } from './Share';
import { Rewards } from './Rewards';
import { Scheme } from './Scheme';
import { Marketplace } from './Marketplace';
import classes from './Content.module.scss';

export const Content = () => (
  <>
    <div className={classes.contentMain}>
      <Main />
    </div>
    <div className={classes.content}>
      <Advantages />
      <Share />
      <Rewards />
      <Scheme />
      <Marketplace />
    </div>
  </>
);
