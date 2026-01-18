'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Instagram } from 'lucide-react';
import useSWR from 'swr';

// Client-side fetcher for our internal API route
const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Fetch error');
  }
  return res.json();
});

// Product type used in the UI — matches the API route normalization
type Product = {
  id: string;
  name: string;
  category: string;
  material: string;
  technique: string;
  dimensions: string;
  price: number;
  images?: string[];
  image?: string; // legacy emoji fallback
  active?: boolean;
  stock?: 'available' | 'sold';
};

export default function PotteryLanding() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Hidden admin mode - activated by typing "ceramicadmin" anywhere on the page
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState('');
  const ADMIN_TRIGGER = 'ceramicadmin'; // Type this anywhere to show admin controls

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const newBuffer = (keyBuffer + e.key).slice(-ADMIN_TRIGGER.length);
      setKeyBuffer(newBuffer);

      if (newBuffer === ADMIN_TRIGGER) {
        setShowAdminControls(prev => {
          // When hiding admin controls, reset to ACTIVE only view
          if (prev) {
            setIsPreview(false);
          }
          return !prev;
        });
        setKeyBuffer('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyBuffer]);

  // Products are now loaded from Airtable via `/api/products`.
  // The API will return { products: Product[] } where each product has an `images` array.
  const [isPreview, setIsPreview] = useState(false);
  const [previewSecret, setPreviewSecret] = useState<string | null>(null);

  // Load secret from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('previewSecret');
      if (stored) setPreviewSecret(stored);
    } catch {}
  }, []);

  const buildKey = () => {
    const params = new URLSearchParams();
    if (isPreview) params.set('preview', '1');
    if (previewSecret) params.set('previewSecret', previewSecret);
    const q = params.toString();
    return q ? `/api/products?${q}` : '/api/products';
  };

  const { data, error, isLoading, mutate } = useSWR(buildKey, fetcher, { revalidateOnFocus: false });
  const products = data?.products ?? [];

  // Helper to update preview secret in localStorage and state
  const setSecret = () => {
    const s = prompt('Enter preview secret (keep private)');
    if (!s) return;
    try { window.localStorage.setItem('previewSecret', s); } catch {}
    setPreviewSecret(s);
    // refetch with new secret
    mutate();
  };

  const clearSecret = () => {
    try { window.localStorage.removeItem('previewSecret'); } catch {}
    setPreviewSecret(null);
    mutate();
  };

  const filteredProducts: Product[] = selectedCategory === 'all' 
    ? products 
    : products.filter((p: Product) => p.category === selectedCategory);

  // Loading / error UI handled inline
  const loadingUI = isLoading ? (
    <p className="text-sm text-gray-500">Cargando productos…</p>
  ) : null;

  const errorUI = error ? (
    <p className={`text-sm ${error.message?.includes('Unauthorized') ? 'text-yellow-600' : 'text-red-600'}`}>
      {error.message?.includes('Unauthorized')
        ? 'Acceso denegado. Verifica el secret e inténtalo de nuevo.'
        : `Error cargando productos: ${String(error.message || error)}`}
    </p>
  ) : null;

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'jarron', label: 'Jarrones' },
    { id: 'jarra', label: 'Jarras' },
    { id: 'set', label: 'Sets' },
    { id: 'taza', label: 'Tazas' }
  ];

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-center">
            <img src="/logo.jpg" alt="its ceramic" className="h-48 w-auto" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-semibold text-gray-900 mb-6">
              Piezas de gres hechas a mano
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Cerámica artesanal torneada y esmaltada completamente a mano. Cada pieza es única.
            </p>
            <p className="text-sm text-gray-600">
              Técnicas tradicionales · Producción limitada · Encargos personalizados
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-4 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-sm font-medium transition-colors px-4 py-2 ${
                    selectedCategory === cat.id
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {/* Admin preview controls - hidden until "ceramicadmin" is typed */}
              {showAdminControls && (
                <div className="ml-4 flex items-center space-x-3 bg-yellow-50 px-3 py-1 rounded border border-yellow-200">
                  <span className="text-xs text-yellow-700">Admin</span>
                  <button
                    onClick={() => { setIsPreview(p => !p); mutate(); }}
                    className={`text-xs px-2 py-1 border ${isPreview ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-500'} rounded`}
                  >
                    Inventory: {isPreview ? 'ALL' : 'ACTIVE'}
                  </button>

                  {previewSecret ? (
                    <button onClick={clearSecret} className="text-xs text-gray-500">Clear secret</button>
                  ) : (
                    <button onClick={setSecret} className="text-xs text-gray-500">Set preview secret</button>
                  )}
                </div>
              )}
            </div>

            {loadingUI}
            {errorUI}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map((product: Product) => (
              <div key={product.id} className="group">
                {/* Image */}
                <div className="relative bg-gray-100 aspect-square mb-8 flex items-center justify-center border border-gray-200 overflow-hidden">
                  {/* Sold ribbon */}
                  {product.stock === 'sold' && (
                    <div className="absolute top-4 right-[-35px] z-10 rotate-45 bg-stone-600 text-white text-xs font-medium py-1 px-10 shadow-sm">
                      Agotado
                    </div>
                  )}
                  {/* If Airtable provides images, use the first attachment; otherwise fall back to emoji */}
                  {product.images && product.images.length > 0 ? (
                    // Use native img for simplicity; image optimization can be added later
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-8xl opacity-20">{product.image || '🏺'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {product.material}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <p>{product.technique}</p>
                    <p className="text-gray-600">{product.dimensions}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-gray-200 py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-sm text-gray-600">
            Cada pieza es realizada de forma completamente artesanal. No existen dos piezas idénticas. Disponibles encargos personalizados en colores y tamaños específicos.
          </p>
          <div className="space-y-3 text-sm text-gray-700">
            <p>• Torneadas a mano</p>
            <p>• Esmaltadas a mano</p>
            <p>• Envíos a toda Europa</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-gray-200 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-semibold text-gray-900">
            Contacta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <a
              href="mailto:itsasoarana@gmail.com"
              className="border border-gray-200 p-8 text-center hover:bg-gray-50 transition-colors"
            >
              <Mail size={28} className="mx-auto mb-4 text-gray-700" />
              <p className="text-sm text-gray-600 mb-2">Email</p>
              <p className="font-medium text-gray-900">itsasoarana@gmail.com</p>
            </a>

            <a
              href="https://instagram.com/its___arana"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 p-8 text-center hover:bg-gray-50 transition-colors"
            >
              <Instagram size={28} className="mx-auto mb-4 text-gray-700" />
              <p className="text-sm text-gray-600 mb-2">Instagram</p>
              <p className="font-medium text-gray-900">@its___arana</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-600">
          <p>© 2025 its ceramic Barcelona. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}