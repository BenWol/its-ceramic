import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '../../lib/airtable';

type ProductCardProps = {
  product: Product;
  showCollection?: boolean;
};

export default function ProductCard({ product, showCollection = false }: ProductCardProps) {
  const isSoldOut = product.stock === 'sold';

  return (
    <Link href={`/piezas/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative bg-gray-100 aspect-square mb-4 flex items-center justify-center border border-gray-200 overflow-hidden">
        {/* Sold out badge */}
        {isSoldOut && (
          <div className="absolute top-3 left-3 z-10 bg-gray-600 text-white text-xs font-medium py-1 px-3">
            Agotado
          </div>
        )}

        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl opacity-20">🏺</span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {showCollection && product.collection && (
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.collection}
          </p>
        )}

        <p className="text-sm text-gray-600">
          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(product.price)}
        </p>
      </div>
    </Link>
  );
}
