'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import ProductCard, { Product } from '../../components/ProductCard';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const collectionInfo: Record<string, { name: string; description: string; airtableValue: string }> = {
  circus: {
    name: 'Colección Circus',
    description: 'Jarrones de cerámica artesanal de formas redondeadas y estética expresiva. Piezas con un espíritu lúdico y contemporáneo, concebidas como objetos decorativos con identidad propia.',
    airtableValue: 'Circus',
  },
  marmol: {
    name: 'Colección Mármol',
    description: 'Jarrones de cerámica artesanal inspirados en las vetas y contrastes del mármol. Piezas únicas de carácter decorativo, donde el color y la superficie adquieren protagonismo.',
    airtableValue: 'Mármol',
  },
  materia: {
    name: 'Colección Materia',
    description: 'Cerámica artesanal de mesa en tonos tierra, pensada para el uso cotidiano. Piezas funcionales de formas orgánicas que acompañan la mesa del día a día.',
    airtableValue: 'Materia',
  },
};

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading } = useSWR('/api/products', fetcher);
  const products: Product[] = data?.products ?? [];

  const info = collectionInfo[slug];

  // Filter products by collection (match Airtable collection value)
  const collectionProducts = products.filter((p) => {
    return p.collection === info?.airtableValue;
  });

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Colección no encontrada</h1>
          <Link href="/colecciones" className="text-gray-600 hover:text-gray-900">
            ← Volver a colecciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <Link href="/colecciones" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
            ← Colecciones
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            {info.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            {info.description}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-gray-500 text-center">Cargando piezas...</p>
          ) : collectionProducts.length === 0 ? (
            <p className="text-gray-500 text-center">No hay piezas en esta colección todavía.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
