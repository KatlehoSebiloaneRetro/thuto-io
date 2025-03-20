export interface Notification {
  id: string;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  duration?: number;
  autoClose?: boolean;
  actionText?: string;
  actionFn?: () => void;
  timestamp?: string;
  raw?: any; // Store original notification data
}