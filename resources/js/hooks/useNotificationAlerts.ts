import { useEffect, useRef, useState } from 'react';
import { router, usePage, usePoll } from '@inertiajs/react';
import { toast } from 'sonner';
import {
  isNotificationSoundEnabled,
  playNotificationChime,
  setNotificationSoundEnabled,
} from '@/lib/sound';
import type { AppNotification } from '@/types/notification';

export function useNotificationSound() {
  const [soundEnabled, setSoundEnabledState] = useState(() => isNotificationSoundEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setNotificationSoundEnabled(next);
    if (next) {
      playNotificationChime();
    }
  };

  return {
    soundEnabled,
    toggleSound,
    playTestChime: playNotificationChime,
  };
}

export function useNotificationAlerts(pollInterval = 30000) {
  const { notifications } = usePage().props;
  const { soundEnabled, toggleSound, playTestChime } = useNotificationSound();

  // Unconditionally poll notifications prop in background
  usePoll(pollInterval, { only: ['notifications'] });

  const seenNotificationIds = useRef<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  useEffect(() => {
    const recent: AppNotification[] = notifications?.recent ?? [];

    // On initial mount, record existing IDs so we do not chime on existing notifications
    if (isFirstRender.current) {
      recent.forEach((n) => seenNotificationIds.current.add(n.id));
      isFirstRender.current = false;
      return;
    }

    // Detect new incoming notifications that haven't been seen in this session
    const newItems = recent.filter(
      (n) => !n.read_at && !seenNotificationIds.current.has(n.id)
    );

    if (newItems.length > 0) {
      // Mark as seen
      newItems.forEach((n) => seenNotificationIds.current.add(n.id));

      // Play chime
      playNotificationChime();

      // Show toast for the latest notification
      const latest = newItems[0];
      const targetUrl = `/notifications/${latest.id}/go`;

      toast(latest.data.title, {
        description: latest.data.message,
        action: {
          label: 'Buka',
          onClick: () => router.visit(targetUrl),
        },
        duration: 7000,
      });

      // Browser Desktop Notification if granted
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          const desktopNotif = new Notification(latest.data.title, {
            body: latest.data.message,
            icon: '/images/logo/logo-icon.png',
          });
          desktopNotif.onclick = () => {
            window.focus();
            router.visit(targetUrl);
            desktopNotif.close();
          };
        } catch {
          // ignore
        }
      }
    }
  }, [notifications]);

  return {
    soundEnabled,
    toggleSound,
    playTestChime: playNotificationChime,
  };
}
