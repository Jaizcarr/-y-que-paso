import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { LogoMark } from './Placeholders';

export default function NotFoundView() {
  useDocumentMeta({
    title: 'Página no encontrada',
    description: 'Esta página no existe en Y QUÉ PASÓ?.',
    noindex: true,
  });

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <LogoMark className="w-16 h-16 opacity-60" />
      <h1 className="font-baloo text-2xl font-bold text-white">Esta página no existe</h1>
      <p className="text-sm text-[var(--text-muted)] max-w-md">
        Puede que el enlace esté roto o que esa serie o personaje ya no exista.
      </p>
      <Link
        to="/"
        className="mt-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-[#1e1d1b] text-sm font-bold hover:brightness-110 transition-all"
      >
        Volver a inicio
      </Link>
    </div>
  );
}
