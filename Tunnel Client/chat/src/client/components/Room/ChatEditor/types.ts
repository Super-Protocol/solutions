export enum Fields {
  message = 'message',
}

export interface FormValues {
  [Fields.message]: string;
}

export interface ChatEditorProps {
  onSendMessage?: (message: string) => void;
  className?: string;
}