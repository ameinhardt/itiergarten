type ToastPriority = 'info' | 'warning' | 'error';

export interface Toast {
  message: string;
  type?: ToastPriority;
  duration?: number;
}
