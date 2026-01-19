'use client';

import Link from 'next/link';
import useSWR from 'swr';
import ProductCard, { Product } from './components/ProductCard';
import InstagramEmbed from './components/InstagramEmbed';
import { useSiteContent } from './hooks/useSiteImages';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const collections = [
  {
    slug: 'circus',
    key: 'collection-circus',
    fallbackName: 'Circus',
    fallbackDescription: 'Jarrones de estética expresiva y espíritu lúdico.',
  },
  {
    slug: 'marmol',
    key: 'collection-marmol',
    fallbackName: 'Mármol',
    fallbackDescription: 'Inspirados en las vetas y contrastes del mármol.',
  },
  {
    slug: 'materia',
    key: 'collection-materia',
    fallbackName: 'Materia',
    fallbackDescription: 'Cerámica de mesa en tonos tierra para el día a día.',
  },
];

export default function HomePage() {
  const { data } = useSWR('/api/products', fetcher);
  const products: Product[] = data?.products ?? [];
  const { getImage, getAlt, getTitle, getDescription } = useSiteContent();

  // Featured products (first 4)
  const featuredProducts = products.slice(0, 4);

  const heroImage = getImage('hero');
  const aboutImage = getImage('about-home');

  // Text content with fallbacks
  const heroTitle = getTitle('hero', 'Cerámica artesanal');
  const heroDescription = getDescription('hero', 'Piezas de gres torneadas y esmaltadas completamente a mano. Cada pieza es única.');
  const aboutTitle = getTitle('about-home', 'Hecho a mano en Barcelona');
  const aboutDescription = getDescription('about-home', 'Cada pieza está torneada y esmaltada completamente a mano, siguiendo técnicas tradicionales. Creo en la producción limitada y en el valor de lo hecho a mano.');

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gray-100 border-b border-gray-200">
        {/* Hero image */}
        {heroImage ? (
          <img
            src={heroImage}
            alt={getAlt('hero', 'Cerámica artesanal')}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
            <span className="text-gray-400 text-xs font-mono">[hero:image]</span>
            <span className="text-gray-400">Imagen principal</span>
          </div>
        )}

        {/* Overlay for text readability */}
        {heroImage && <div className="absolute inset-0 bg-white/40" />}

        {/* Overlay content */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl mx-auto">
            {heroDescription}
          </p>
          <Link
            href="/colecciones"
            className="inline-block bg-gray-900 text-white py-4 px-8 font-medium hover:bg-gray-800 transition-colors"
          >
            Ver colecciones
          </Link>
        </div>
      </section>

      {/* Collections Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Colecciones
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {getDescription('collections-intro', 'Tres líneas que hablan distintos acentos dentro del mismo lenguaje artesanal.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection) => {
              const imageUrl = getImage(collection.key);
              const title = getTitle(collection.key, collection.fallbackName);
              const description = getDescription(collection.key, collection.fallbackDescription);

              return (
                <Link
                  key={collection.slug}
                  href={`/colecciones/${collection.slug}`}
                  className="group"
                >
                  <div className="aspect-[4/3] bg-gray-100 border border-gray-200 mb-4 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-1">
                        <span className="text-gray-400 text-xs font-mono">[{collection.key}:image]</span>
                        <span className="text-gray-400 text-sm">{collection.fallbackName}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Piezas destacadas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showCollection />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/piezas"
                className="inline-block border border-gray-900 text-gray-900 py-3 px-8 font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                Ver todas las piezas
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Teaser */}
      <section className="py-20 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="aspect-square bg-gray-100 border border-gray-200 overflow-hidden order-2 lg:order-1">
              {aboutImage ? (
                <img
                  src={aboutImage}
                  alt={getAlt('about-home', 'Sobre mí')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-1">
                  <span className="text-gray-400 text-xs font-mono">[about-home:image]</span>
                  <span className="text-gray-400 text-sm">Foto del artista</span>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                {aboutTitle}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {aboutDescription}
              </p>
              <Link
                href="/sobre-mi"
                className="text-gray-900 font-medium hover:text-gray-600 transition-colors"
              >
                Conocer más →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            @its___arana
          </h2>
          <p className="text-gray-600 mb-8">
            {getDescription('instagram-intro', 'Sígueme en Instagram para ver el proceso y las últimas novedades.')}
          </p>

          {/* Instagram Embed */}
          <div className="mb-8">
            <InstagramEmbed username="its___arana" />
          </div>

          <a
            href="https://instagram.com/its___arana"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-gray-900 text-gray-900 py-3 px-8 font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Seguir en Instagram
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            {getTitle('contact-cta', '¿Tienes algo en mente?')}
          </h2>
          <p className="text-gray-600 mb-8">
            {getDescription('contact-cta', 'Todas las piezas se realizan bajo encargo. Si buscas algo específico, escríbeme y lo diseñamos juntas.')}
          </p>
          <Link
            href="/contacto"
            className="inline-block bg-gray-900 text-white py-4 px-8 font-medium hover:bg-gray-800 transition-colors"
          >
            Contactar
          </Link>
        </div>
      </section>
    </div>
  );
}
