import { ReactNode, HTMLInputTypeAttribute } from 'react';
import { Theme } from '@/utils/types';

export type Check = { val: string | number | undefined, check?: boolean; };
export interface InputUiProps {
    'data-testid'?: string;
    id?: string;
    value?: number | string;
    placeholder?: string;
    label?: string;
    tooltip?: string | ReactNode;
    prepend?: (prependProps: { focused: boolean }) => string | ReactNode;
    append?: (prependProps: { focused: boolean }) => string | ReactNode;
    disabled?: boolean;
    classNameWrap?: string;
    classNameLabel?: string;
    classNameInput?: string;
    classNamePrepend?: string;
    classNameAppend?: string;
    classNameErrorEmpty?: string;
    classNameError?: string;
    classNameInputLabelFocused?: string;
    classNameInputLabel?: string;
    error?: string;
    min?: number;
    max?: number;
    name?: string;
    isInvalid?: boolean;
    autoComplete?: string;
    isNumber?: boolean;
    showError?: boolean;
    showInvalid?: boolean;
    showInvalidRange?: boolean;
    isFloat?: boolean;
    isPositive?: boolean;
    isDate?: boolean;
    onChange?: Function;
    onKeyDown?: Function;
    onBlur?: Function;
    onFocus?: Function;
    loading?: boolean;
    as?: 'textarea' | 'input';
    resize?: 'none'
        | 'inherit'
        | '-moz-initial'
        | 'initial'
        | 'revert'
        | 'unset'
        | 'block'
        | 'both'
        | 'horizontal'
        | 'inline'
        | 'vertical';
    autosize?: boolean;
    mask?: string;
    alwaysShowMask?: boolean;
    beforeMaskedStateChange?: Function;
    renderError?: (error: any) => ReactNode;
    maxRows?: number;
    minRows?: number;
    emptyError?: boolean;
    theme?: Theme;
    type?: HTMLInputTypeAttribute;
    autoFocus?: boolean;
    showCounter?: boolean;
    isValidateRange?: boolean;
}

export enum InputUiTypes {
    REGULAR,
    PHONE,
}

export interface InputFormikProps extends InputUiProps {
    name: string;
    debounceInterval?: number | null;
    checkTouched?: boolean;
    inputUiType?: InputUiTypes;
    onChange?: Function;
    isInvalid?: boolean;
}

export interface InputWithResetProps {
    onChange?: Function;
}

export enum keyCodes {
    ARROW_UP = 38,
    ARROW_DOWN = 40,
}

export interface InputPhoneProps extends InputUiProps {

}
