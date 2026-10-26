import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCatalog } from '../../../lib/airtable';
import ProductCard from '../../components/ProductCard';

export const revalidate = false;

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { products, collections } = await getCatalog();
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const info = { name: `Colección ${collection.name}`, description: collection.description };
  const collectionProducts = products.filter((p) => p.collection === collection.name);

  return (
    <div className="bg-warm-white">
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
          {collectionProducts.length === 0 ? (
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
