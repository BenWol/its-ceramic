import { Mail, Instagram } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            Contacto
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o quieres hacer un encargo personalizado? Escríbeme y lo vemos juntas.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email */}
            <a
              href="mailto:itsasoarana@gmail.com"
              className="border border-gray-200 p-8 text-center hover:bg-gray-50 transition-colors group"
            >
              <Mail size={32} className="mx-auto mb-4 text-gray-600 group-hover:text-gray-900" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">itsasoarana@gmail.com</p>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/its___arana"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 p-8 text-center hover:bg-gray-50 transition-colors group"
            >
              <Instagram size={32} className="mx-auto mb-4 text-gray-600 group-hover:text-gray-900" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Instagram</h3>
              <p className="text-gray-600">@its___arana</p>
            </a>
          </div>
        </div>
      </section>

      {/* Custom Orders Section */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Encargos personalizados
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Todas las piezas se realizan bajo encargo. Cada unidad es única y puede presentar ligeras variaciones. Si buscas algo específico en color, tamaño o forma, escríbeme y lo diseñamos juntas.
          </p>

          <div className="bg-white border border-gray-200 p-6 text-left space-y-4">
            <h3 className="font-medium text-gray-900">Proceso de encargo</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
              <li>Escríbeme por email o Instagram con tu idea</li>
              <li>Hablamos sobre los detalles: tamaño, color, cantidad</li>
              <li>Te envío un presupuesto personalizado</li>
              <li>Una vez confirmado, comienzo a trabajar en tu pieza</li>
              <li>Tiempo de producción: 15-20 días laborables</li>
            </ol>
          </div>

          <a
            href="mailto:itsasoarana@gmail.com?subject=Encargo%20personalizado"
            className="inline-block bg-gray-800 text-white py-4 px-8 font-medium hover:bg-gray-900 transition-colors"
          >
            Solicitar encargo
          </a>
        </div>
      </section>
    </div>
  );
}
