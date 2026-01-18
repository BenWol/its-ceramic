import Link from 'next/link';

export type Product = {
  id: string;
  name: string;
  category: string;
  collection?: string;
  material: string;
  technique: string;
  dimensions: string;
  price: number;
  description?: string;
  images?: string[];
  image?: string;
  active?: boolean;
  stock?: 'available' | 'sold';
};

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
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl opacity-20">{product.image || '🏺'}</span>
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
