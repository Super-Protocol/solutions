import { Header, Content, Footer } from '@/views';
import classes from './App.module.scss';

export const App = () => (
  <div className={classes.content}>
    <Header />
    <Content />
    <Footer />
  </div>
);
