'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../../lib/airtable';

const categories = [
  { id: 'all', label: 'Todas' },
  { id: 'jarron', label: 'Jarrones' },
  { id: 'jarra', label: 'Jarras' },
  { id: 'set', label: 'Sets' },
  { id: 'taza', label: 'Tazas' },
];

export default function ProductFilter({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
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
          {filteredProducts.length === 0 ? (
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
    </>
  );
}
