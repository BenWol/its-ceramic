'use client';

import { useSiteContent } from '../hooks/useSiteImages';

// Helper to render text with **bold** markdown support
function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function SobreMiPage() {
  const { getImage, getAlt, getDescription } = useSiteContent();

  const artistImage = getImage('about-artist');
  const studioImage1 = getImage('about-studio-1');
  const studioImage2 = getImage('about-studio-2');
  const studioImage3 = getImage('about-studio-3');

  // Text content with fallbacks
  const aboutIntro = getDescription('about-intro', 'Soy ceramista artesanal con base en Barcelona. Cada una de mis piezas está torneada y esmaltada completamente a mano, siguiendo técnicas tradicionales.');
  const aboutIntro2 = getDescription('about-intro-2', '');
  const aboutWork = getDescription('about-work', 'Mi trabajo se centra en crear piezas únicas que combinan funcionalidad y belleza. Trabajo principalmente con gres, un material noble que permite acabados variados y duraderos.');
  const aboutPhilosophy = getDescription('about-philosophy', 'Creo en la producción limitada y en el valor de lo hecho a mano. Cada pieza que sale de mi taller lleva consigo horas de trabajo, cuidado y dedicación.');
  const aboutBullets = getDescription('about-bullets', 'Torneadas a mano\nEsmaltadas a mano\nProducción limitada\nEncargos personalizados\nEnvíos a toda Europa');
  const studioDescription = getDescription('about-studio', 'Mi taller está ubicado en Barcelona, donde trabajo cada día creando nuevas piezas y desarrollando mis colecciones.');

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            Sobre mí
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="aspect-[3/4] bg-gray-100 border border-gray-200 overflow-hidden">
              {artistImage ? (
                <img
                  src={artistImage}
                  alt={getAlt('about-artist', 'La artista')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                  <span className="text-gray-400 text-xs font-mono">[about-artist:image]</span>
                  <span className="text-gray-400 text-sm">Foto del artista</span>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                {renderWithBold(aboutIntro)}
              </p>

              {aboutIntro2 && !aboutIntro2.startsWith('[') && (
                <p className="text-gray-600 leading-relaxed">
                  {renderWithBold(aboutIntro2)}
                </p>
              )}

              <p className="text-gray-600 leading-relaxed">
                {renderWithBold(aboutWork)}
              </p>

              <p className="text-gray-600 leading-relaxed">
                {renderWithBold(aboutPhilosophy)}
              </p>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 leading-relaxed">
                  {aboutBullets.split('\n').map((line, i) => (
                    <span key={i}>
                      • {line}
                      {i < aboutBullets.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Section */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            El taller
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {studioDescription}
          </p>

          {/* Studio Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {[
              { image: studioImage1, key: 'about-studio-1', fallback: 'Foto taller 1' },
              { image: studioImage2, key: 'about-studio-2', fallback: 'Foto taller 2' },
              { image: studioImage3, key: 'about-studio-3', fallback: 'Foto taller 3' },
            ].map((item, idx) => (
              <div key={idx} className="aspect-square bg-gray-200 border border-gray-300 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={getAlt(item.key, item.fallback)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-1">
                    <span className="text-gray-400 text-xs font-mono">[{item.key}:image]</span>
                    <span className="text-gray-400 text-xs">{item.fallback}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
