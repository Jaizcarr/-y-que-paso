import { useEffect } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Standard modal-dialog accessibility: Escape closes it, Tab is trapped
// inside it, focus moves into it on open and returns to whatever triggered
// it on close. `containerRef` must point at the dialog's outer DOM node.
export function useModalA11y(containerRef, onClose) {
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const container = containerRef.current;
    container?.querySelector(FOCUSABLE_SELECTOR)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const items = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [containerRef, onClose]);
}
