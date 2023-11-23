import { useToast as useToastUi } from '@/ui/Toast/hooks/useToast';
import { useTheme } from '@/contexts/ThemeContext';

const useToast = () => {
  const { theme } = useTheme();
  const toast = useToastUi({ theme });
  return toast;
};

export default useToast;