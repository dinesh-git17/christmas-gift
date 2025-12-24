"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";

import type { PluginListenerHandle } from "@capacitor/core";

interface UseCapacitorAppOptions {
  onResume?: () => void;
  onPause?: () => void;
}

/**
 * Hook to handle Capacitor app lifecycle events.
 * Only activates when running as a native Capacitor app.
 */
export function useCapacitorApp(options: UseCapacitorAppOptions): void {
  const { onResume, onPause } = options;
  const listenerRef = useRef<PluginListenerHandle | null>(null);

  useEffect(() => {
    // Only run in native Capacitor environment
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const setupListener = async (): Promise<void> => {
      listenerRef.current = await App.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            onResume?.();
          } else {
            onPause?.();
          }
        }
      );
    };

    setupListener();

    return () => {
      listenerRef.current?.remove();
    };
  }, [onResume, onPause]);
}

/**
 * Check if running as a native Capacitor app
 */
export function isCapacitorNative(): boolean {
  return Capacitor.isNativePlatform();
}
