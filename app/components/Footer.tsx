import Link from 'next/link';
import Image from 'next/image';
import { Mail, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/">
              <Image src="/logo.jpg" alt="its ceramic" width={48} height={48} className="h-12 w-auto mb-4" />
            </Link>
            <p className="text-sm text-gray-600">
              Cerámica artesanal hecha a mano en Barcelona.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Navegación</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/colecciones" className="text-sm text-gray-600 hover:text-gray-900">
                Colecciones
              </Link>
              <Link href="/piezas" className="text-sm text-gray-600 hover:text-gray-900">
                Piezas
              </Link>
              <Link href="/sobre-mi" className="text-sm text-gray-600 hover:text-gray-900">
                Sobre mí
              </Link>
              <Link href="/contacto" className="text-sm text-gray-600 hover:text-gray-900">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Contacto</h4>
            <div className="flex flex-col space-y-3">
              <a
                href="mailto:itsasoarana@gmail.com"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Mail size={16} className="mr-2" />
                itsasoarana@gmail.com
              </a>
              <a
                href="https://instagram.com/its___arana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Instagram size={16} className="mr-2" />
                @its___arana
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} its ceramic Barcelona. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
