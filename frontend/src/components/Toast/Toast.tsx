'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const icons = {
          success: CheckCircle2,
          error: XCircle,
          warning: AlertCircle,
          info: Info,
        };
        const Icon = icons[notification.type];

        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-md animate-in slide-in-from-right',
              {
                'bg-green-50 border-green-200 text-green-900':
                  notification.type === 'success',
                'bg-red-50 border-red-200 text-red-900':
                  notification.type === 'error',
                'bg-yellow-50 border-yellow-200 text-yellow-900':
                  notification.type === 'warning',
                'bg-blue-50 border-blue-200 text-blue-900':
                  notification.type === 'info',
              }
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const { addNotification } = useUIStore();

  return {
    success: (message: string) => {
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        message,
        timestamp: new Date(),
      });
    },
    error: (message: string) => {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        message,
        timestamp: new Date(),
      });
    },
    warning: (message: string) => {
      addNotification({
        id: Date.now().toString(),
        type: 'warning',
        message,
        timestamp: new Date(),
      });
    },
    info: (message: string) => {
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        message,
        timestamp: new Date(),
      });
    },
  };
}

