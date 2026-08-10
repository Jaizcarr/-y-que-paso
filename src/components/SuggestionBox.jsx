import React, { useState, useRef } from 'react';
import { MessageCircle, X, Send, Check } from 'lucide-react';
import { submitSuggestion } from '../services/suggestions';
import { useModalA11y } from '../hooks/useModalA11y';

const MAX_LENGTH = 2000;

export default function SuggestionBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  const close = () => {
    setIsOpen(false);
    // Reset shortly after closing, once focus has already moved back out.
    setTimeout(() => { setSent(false); setError(''); setMessage(''); setName(''); }, 200);
  };

  useModalA11y(panelRef, close, isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    setIsSending(true);
    setError('');
    try {
      await submitSuggestion(message, name);
      setSent(true);
    } catch (err) {
      setError('No se pudo enviar. Inténtalo de nuevo en un momento.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Enviar una sugerencia"
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[var(--accent)] text-[#1e1d1b] shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-end p-4 sm:p-6 bg-black/30"
          onClick={close}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggestion-box-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm glass-panel rounded-2xl shadow-2xl p-5 font-opensans"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 id="suggestion-box-title" className="font-baloo text-base font-bold text-white">
                ¿Alguna idea o sugerencia?
              </h2>
              <button
                onClick={close}
                aria-label="Cerrar"
                className="p-1.5 rounded-full bg-white/5 hover:bg-[var(--accent-soft)] text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-200">¡Gracias! Hemos recibido tu sugerencia.</p>
                <button
                  onClick={close}
                  className="mt-1 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre (opcional)"
                  maxLength={80}
                  className="w-full bg-black/20 text-xs text-gray-200 placeholder-gray-400 px-3 py-2 rounded-lg border border-[var(--border-soft)] focus:outline-none focus:border-[var(--accent)]"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos qué añadirías o cambiarías..."
                  maxLength={MAX_LENGTH}
                  rows={4}
                  required
                  aria-label="Tu sugerencia"
                  className="w-full bg-black/20 text-sm text-gray-100 placeholder-gray-400 px-3 py-2 rounded-lg border border-[var(--border-soft)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
                {error && <p className="text-xs text-red-300">{error}</p>}
                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-[var(--accent)] text-[#1e1d1b] text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSending ? 'Enviando...' : 'Enviar sugerencia'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
