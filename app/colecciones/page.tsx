import Link from 'next/link';
import Image from 'next/image';
import { getSiteContent, createSiteContentHelpers } from '../../lib/airtable';

export const revalidate = 60;

const collections = [
  {
    slug: 'circus',
    key: 'collection-circus',
    fallbackName: 'Colección Circus',
    fallbackDescription: 'Jarrones de cerámica artesanal de formas redondeadas y estética expresiva. Piezas con un espíritu lúdico y contemporáneo, concebidas como objetos decorativos con identidad propia.',
  },
  {
    slug: 'marmol',
    key: 'collection-marmol',
    fallbackName: 'Colección Mármol',
    fallbackDescription: 'Jarrones de cerámica artesanal inspirados en las vetas y contrastes del mármol. Piezas únicas de carácter decorativo, donde el color y la superficie adquieren protagonismo.',
  },
  {
    slug: 'materia',
    key: 'collection-materia',
    fallbackName: 'Colección Materia',
    fallbackDescription: 'Cerámica artesanal de mesa en tonos tierra, pensada para el uso cotidiano. Piezas funcionales de formas orgánicas que acompañan la mesa del día a día.',
  },
];

export default async function ColeccionesPage() {
  const siteContent = await getSiteContent();
  const { getImage, getTitle, getDescription, getAlt } = createSiteContentHelpers(siteContent);

  return (
    <div className="bg-warm-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            Colecciones
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {getDescription('collections-intro', 'Cada colección cuenta una historia diferente. Tres líneas que hablan distintos acentos dentro del mismo lenguaje artesanal.')}
          </p>
        </div>
      </section>

      {/* Collections */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          {collections.map((collection, index) => {
            const imageUrl = getImage(collection.key);
            const title = getTitle(collection.key, collection.fallbackName);
            const description = getDescription(collection.key, collection.fallbackDescription);
            const alt = getAlt(collection.key, title);

            return (
              <div
                key={collection.slug}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative aspect-[4/3] bg-gray-100 border border-gray-200 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-1">
                        <span className="text-gray-400 text-xs font-mono">[{collection.key}:image]</span>
                        <span className="text-gray-400 text-sm">{collection.fallbackName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                    {title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    {description}
                  </p>
                  <Link
                    href={`/colecciones/${collection.slug}`}
                    className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    Ver colección
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
