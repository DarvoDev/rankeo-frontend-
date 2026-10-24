import { useCallback, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Toast.module.css';
import { ToastContext } from './toastContext';

const TOAST_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<number>(undefined);

  const toast = useCallback((text: string) => {
    setMessage(text);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div role="status" className={cx(styles.toast, visible && styles.show)}>{message}</div>
    </ToastContext.Provider>
  );
}
