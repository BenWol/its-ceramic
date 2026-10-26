'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../../lib/airtable';

// Plural labels and display order for known Airtable categories; any new category
// still gets a filter button, labelled with its capitalised name and shown last.
const categoryLabels: Record<string, string> = {
  jarron: 'Jarrones',
  jarra: 'Jarras',
  set: 'Sets',
  taza: 'Tazas',
  portavelas: 'Portavelas',
  bandeja: 'Bandejas',
};

const categoryLabel = (id: string) =>
  categoryLabels[id] || id.charAt(0).toUpperCase() + id.slice(1);

export default function ProductFilter({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const knownOrder = Object.keys(categoryLabels);
  const presentCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort((a, b) => {
    const ia = knownOrder.indexOf(a);
    const ib = knownOrder.indexOf(b);
    return (ia === -1 ? knownOrder.length : ia) - (ib === -1 ? knownOrder.length : ib) || a.localeCompare(b);
  });
  const categories = [
    { id: 'all', label: 'Todas' },
    ...presentCategories.map((id) => ({ id, label: categoryLabel(id) })),
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      {/* Filters */}
      <section className="py-6 px-6 border-b border-gray-200 sticky top-[73px] bg-warm-white z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-sm font-medium transition-colors px-4 py-2 border ${
                  selectedCategory === cat.id
                    ? 'border-gray-900 text-gray-900 bg-warm-gray'
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
