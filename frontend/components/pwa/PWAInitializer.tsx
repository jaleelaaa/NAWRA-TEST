'use client';

import { useEffect, useState } from 'react';
import { register, getInstallPrompt, isAppInstalled } from '@/lib/pwa/serviceWorkerRegistration';
import { toast } from 'sonner';

export function PWAInitializer() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    setIsInstalled(isAppInstalled());

    // Register service worker
    register({
      onSuccess: () => {
        console.log('[PWA] Service worker registered successfully');
        toast.success('App is ready for offline use');
      },
      onUpdate: () => {
        console.log('[PWA] New version available');
        setUpdateAvailable(true);
        toast.info('New version available! Refresh to update.', {
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
          duration: 10000,
        });
      },
      onError: (error) => {
        console.error('[PWA] Service worker registration failed:', error);
      },
    });

    // Listen for install prompt
    getInstallPrompt((prompt) => {
      setInstallPrompt(prompt);
      // Show install prompt after 30 seconds if not installed
      if (!isAppInstalled()) {
        setTimeout(() => {
          showInstallPrompt();
        }, 30000);
      }
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('App installed successfully!');
    });

    // Cleanup
    return () => {
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const showInstallPrompt = () => {
    if (!installPrompt || isInstalled) return;

    toast.info('Install NAWRA app for better experience', {
      action: {
        label: 'Install',
        onClick: handleInstall,
      },
      duration: 10000,
    });
  };

  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    // Clear the install prompt
    setInstallPrompt(null);
  };

  // This component doesn't render anything, it just handles PWA initialization
  return null;
}
