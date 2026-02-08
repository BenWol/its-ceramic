import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts } from '../../../lib/airtable';
import ProductCard from '../../components/ProductCard';

export const revalidate = 60;

const collectionInfo: Record<string, { name: string; description: string; slug: string }> = {
  circus: {
    name: 'Colección Circus',
    description: 'Jarrones de cerámica artesanal de formas redondeadas y estética expresiva. Piezas con un espíritu lúdico y contemporáneo, concebidas como objetos decorativos con identidad propia.',
    slug: 'circus',
  },
  marmol: {
    name: 'Colección Mármol',
    description: 'Jarrones de cerámica artesanal inspirados en las vetas y contrastes del mármol. Piezas únicas de carácter decorativo, donde el color y la superficie adquieren protagonismo.',
    slug: 'marmol',
  },
  materia: {
    name: 'Colección Materia',
    description: 'Cerámica artesanal de mesa en tonos tierra, pensada para el uso cotidiano. Piezas funcionales de formas orgánicas que acompañan la mesa del día a día.',
    slug: 'materia',
  },
};

// Normalize string for comparison (remove accents, lowercase)
const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const info = collectionInfo[slug];

  if (!info) {
    notFound();
  }

  const products = await getProducts();

  // Filter products by collection (normalize to handle accent variations)
  const collectionProducts = products.filter((p) => {
    return p.collection && normalize(p.collection) === info.slug;
  });

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
