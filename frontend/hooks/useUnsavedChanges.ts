/**
 * Hook to detect and warn about unsaved changes
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onNavigate?: () => void;
}

/**
 * Hook to warn users about unsaved changes when they try to leave the page
 */
export function useUnsavedChanges({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onNavigate,
}: UseUnsavedChangesOptions) {
  const router = useRouter();
  const hasChangesRef = useRef(hasUnsavedChanges);

  // Update ref when hasUnsavedChanges changes
  useEffect(() => {
    hasChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Handle browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message]);

  // Custom navigation handler
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        onNavigate?.();
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  return {
    handleNavigation,
    hasUnsavedChanges,
  };
}
