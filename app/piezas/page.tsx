'use client';

import { useState } from 'react';
import useSWR from 'swr';
import ProductCard, { Product } from '../components/ProductCard';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const categories = [
  { id: 'all', label: 'Todas' },
  { id: 'jarron', label: 'Jarrones' },
  { id: 'jarra', label: 'Jarras' },
  { id: 'set', label: 'Sets' },
  { id: 'taza', label: 'Tazas' },
];

export default function PiezasPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data, isLoading } = useSWR('/api/products', fetcher);
  const products: Product[] = data?.products ?? [];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            Piezas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Todas las piezas disponibles. Cada una torneada y esmaltada completamente a mano.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 border-b border-gray-200 sticky top-[73px] bg-white z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-sm font-medium transition-colors px-4 py-2 border ${
                  selectedCategory === cat.id
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-gray-500 text-center">Cargando piezas...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center">No hay piezas en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showCollection />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
