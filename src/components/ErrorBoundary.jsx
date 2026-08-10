import React from 'react';

// React only supports error boundaries via class components (no hook
// equivalent) — this is the one legitimate place for a class in this app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la aplicación:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4 bg-[var(--bg-app)] text-[var(--text-main)] font-opensans">
          <p className="text-lg font-bold">Algo se rompió inesperadamente.</p>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Prueba a recargar la página. Si el problema persiste después de una carga o edición reciente, revisa esos datos en el panel Admin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 rounded-full bg-[var(--accent)] text-[#1e1d1b] text-sm font-bold"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
