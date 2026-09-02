import { useEffect, useRef } from 'react';

interface UseAutoLockOptions {
  timeoutMinutes: number;
  isUnlocked: boolean;
  onLock: () => void;
}

export function useAutoLock({ timeoutMinutes, isUnlocked, onLock }: UseAutoLockOptions) {
  const timerRef = useRef<number | null>(null);
  const onLockRef = useRef(onLock);
  onLockRef.current = onLock;

  useEffect(() => {
    if (!isUnlocked || timeoutMinutes <= 0) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      const delayMs = timeoutMinutes * 60 * 1000;
      timerRef.current = window.setTimeout(() => {
        onLockRef.current();
      }, delayMs);
    };

    resetTimer();

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // user switched tabs or minimized
      } else {
        resetTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeoutMinutes, isUnlocked]);
}
