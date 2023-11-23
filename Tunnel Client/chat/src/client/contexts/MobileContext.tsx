import {
  FC, createContext, useMemo, ReactNode, useContext,
} from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface IMobileContext {
  isMobile: boolean;
}

export const MobileContext = createContext<IMobileContext>({
  isMobile: false,
});

export interface MobileProviderProps {
  children: ReactNode | string;
}

export const MobileProvider: FC<MobileProviderProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const data = useMemo(() => ({
    isMobile,
  }), [isMobile]);

  return (
    <MobileContext.Provider value={data}>{children}</MobileContext.Provider>
  );
};

export const useMobile = () => {
  const props = useContext(MobileContext);
  return props;
};