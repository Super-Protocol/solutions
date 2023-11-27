import { ModalProps as ModalBootstrapProps } from 'react-bootstrap/Modal';
import { Theme } from '@/utils/types';

export interface ModalProps extends ModalBootstrapProps {
    bodyClassName?: string;
    onClose?: () => void;
    showShadow?: boolean;
    theme?: Theme;
    isShowCloseBtn?: boolean;
}