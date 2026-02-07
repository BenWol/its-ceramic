import { notFound } from 'next/navigation';
import { getProducts, getSiteContent, createSiteContentHelpers } from '../../../lib/airtable';
import ProductDetail from '../../components/ProductDetail';

export const revalidate = 60;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [products, siteContent] = await Promise.all([
    getProducts(),
    getSiteContent(),
  ]);

  const { getDescription } = createSiteContentHelpers(siteContent);

  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  // Related products: same collection, excluding current
  const relatedProducts = products
    .filter((p) => p.id !== id && p.collection === product.collection)
    .slice(0, 4);

  const productNotice = getDescription('product-notice', 'Cada pieza está torneada a mano en el torno; por lo tanto, cada pieza es única y puede presentar ligeras variaciones en forma, tamaño o color.');

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      productNotice={productNotice}
    />
  );
}
