import { getProducts } from '../../lib/airtable';
import ProductFilter from '../components/ProductFilter';

export const revalidate = 60;

export default async function PiezasPage() {
  const products = await getProducts();

  return (
    <div className="bg-warm-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            Piezas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Objetos de cerámica hechos a mano en pequeñas series, pensados para el uso cotidiano.
          </p>
        </div>
      </section>

      <ProductFilter products={products} />
    </div>
  );
}
