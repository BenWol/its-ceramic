'use client';

import React, { useState } from 'react';
import { Mail, Instagram } from 'lucide-react';

export default function PotteryLanding() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = [
    {
      id: 1,
      name: 'Jarron Marmol Rosa',
      category: 'jarron',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '19cm altura × 12cm diámetro',
      price: 68,
      image: '🏺'
    },
    {
      id: 2,
      name: 'Jarron Marmol Azul',
      category: 'jarron',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '19cm altura × 12cm diámetro',
      price: 61,
      image: '🏺'
    },
    {
      id: 3,
      name: 'Jarron Marmol Gris',
      category: 'jarron',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '14cm altura × 12cm diámetro',
      price: 61,
      image: '🏺'
    },
    {
      id: 4,
      name: 'Jarron Rayas Calabaza',
      category: 'jarron',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '12cm altura × 12cm diámetro',
      price: 47,
      image: '🏺'
    },
    {
      id: 5,
      name: 'Jarron Rayas Fresa',
      category: 'jarron',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '20cm altura × 12cm diámetro',
      price: 68,
      image: '🏺'
    },
    {
      id: 6,
      name: 'Jarron Rayas Bombón',
      category: 'jarron',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '18cm altura × 12cm diámetro',
      price: 47,
      image: '🏺'
    },
    {
      id: 7,
      name: 'Jarra Nature Pecas',
      category: 'jarra',
      material: 'Gres Moteado',
      technique: 'Torneado a mano y esmaltado mate',
      dimensions: '15cm altura × 11cm diámetro',
      price: 65,
      image: '🏺'
    },
    {
      id: 8,
      name: 'Set Naranja Dot',
      category: 'set',
      material: 'Gres Moteado',
      technique: 'Torneado a mano, acabado natural y brillante',
      dimensions: '11cm y 4cm altura',
      price: 85,
      image: '🏺'
    },
    {
      id: 9,
      name: 'Taza Café Neriage',
      category: 'taza',
      material: 'Gres PRAI',
      technique: 'Torneado en técnica neriage y esmaltado brillante',
      dimensions: '6cm altura × 7cm diámetro',
      price: 21,
      image: '☕'
    },
    {
      id: 10,
      name: 'Taza Latte Salpicada',
      category: 'taza',
      material: 'Gres PRAI',
      technique: 'Torneado a mano y esmaltado brillante',
      dimensions: '6cm altura × 10cm diámetro',
      price: 25,
      image: '☕'
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'jarron', label: 'Jarrones' },
    { id: 'jarra', label: 'Jarras' },
    { id: 'set', label: 'Sets' },
    { id: 'taza', label: 'Tazas' }
  ];

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-gray-900">its ceramic</h1>
              <p className="text-xs text-gray-500 tracking-widest mt-1">BARCELONA</p>
            </div>
            <p className="text-sm text-gray-600">Cerámica artesanal</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="font-serif text-5xl font-semibold text-gray-900 mb-6">
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
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map(product => (
              <div key={product.id} className="group">
                {/* Image */}
                <div className="bg-gray-100 aspect-square mb-8 flex items-center justify-center border border-gray-200">
                  <span className="text-8xl opacity-20">{product.image}</span>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-2">
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
                    <p className="font-serif text-2xl font-semibold text-gray-900">
                      €{product.price}
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
          <h2 className="font-serif text-4xl font-semibold text-gray-900">
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
              href="https://instagram.com/its__arana"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 p-8 text-center hover:bg-gray-50 transition-colors"
            >
              <Instagram size={28} className="mx-auto mb-4 text-gray-700" />
              <p className="text-sm text-gray-600 mb-2">Instagram</p>
              <p className="font-medium text-gray-900">@its__arana</p>
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