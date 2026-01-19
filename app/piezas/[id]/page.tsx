'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard, { Product } from '../../components/ProductCard';
import ContactModal, { ContactType } from '../../components/ContactModal';
import { useSiteContent } from '../../hooks/useSiteImages';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactType, setContactType] = useState<ContactType>('interest');

  const { data, isLoading } = useSWR('/api/products', fetcher);
  const products: Product[] = data?.products ?? [];
  const { getDescription } = useSiteContent();

  const product = products.find((p) => p.id === productId);

  // Related products: same collection, excluding current
  const relatedProducts = products
    .filter((p) => p.id !== productId && p.collection === product?.collection)
    .slice(0, 4);

  const openModal = (type: ContactType) => {
    setContactType(type);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Pieza no encontrada</h1>
          <Link href="/piezas" className="text-gray-600 hover:text-gray-900">
            ← Volver a piezas
          </Link>
        </div>
      </div>
    );
  }

  const isSoldOut = product.stock === 'sold';
  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href="/piezas" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver a piezas
        </Link>
      </div>

      {/* Product Section */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 border border-gray-200 overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl opacity-20">🏺</span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 text-xs text-gray-600">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 border overflow-hidden ${
                        idx === currentImageIndex ? 'border-gray-900' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {product.category && (
                    <span className="uppercase tracking-wide">
                      Categoría: {product.category}
                    </span>
                  )}
                  {product.collection && (
                    <>
                      <span>|</span>
                      <Link
                        href={`/colecciones/${product.collection.toLowerCase().replace(/á/g, 'a').replace(/ /g, '-')}`}
                        className="hover:text-gray-900"
                      >
                        {product.collection}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(product.price)}
              </p>

              {/* Stock Status & CTA */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {isSoldOut ? (
                  /* Sold out - show encargo option */
                  <>
                    <div className="space-y-1">
                      <p className="text-gray-500 font-medium">Agotado</p>
                      <p className="text-sm text-gray-600">Disponible bajo encargo</p>
                    </div>

                    <button
                      onClick={() => openModal('encargo')}
                      className="w-full bg-gray-800 text-white text-center py-4 px-6 font-medium hover:bg-gray-900 transition-colors"
                    >
                      Encargar esta pieza
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      Tiempo de producción estimado: 15-20 días laborables.
                    </p>
                  </>
                ) : (
                  /* Available - show interest option */
                  <>
                    <div className="space-y-1">
                      <p className="text-green-700 font-medium">Disponible</p>
                    </div>

                    <button
                      onClick={() => openModal('interest')}
                      className="w-full bg-gray-800 text-white text-center py-4 px-6 font-medium hover:bg-gray-900 transition-colors"
                    >
                      Me interesa esta pieza
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      Escríbeme y te cuento todos los detalles.
                    </p>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                {product.material && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">Material: </span>
                    <span className="text-sm text-gray-600">{product.material}</span>
                  </div>
                )}
                {product.technique && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">Técnica: </span>
                    <span className="text-sm text-gray-600">{product.technique}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">Dimensiones: </span>
                    <span className="text-sm text-gray-600">{product.dimensions}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Handmade Notice */}
              <div className="pt-6 border-t border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {getDescription('product-notice', 'Cada pieza está torneada a mano en el torno; por lo tanto, cada pieza es única y puede presentar ligeras variaciones en forma, tamaño o color.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-6 border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={product.name}
        contactType={contactType}
      />
    </div>
  );
}
