'use client';

import { useState } from 'react';
import { Mail, Instagram, Send, Check } from 'lucide-react';

export default function ContactoPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, introduce un email válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject: 'Consulta desde la web',
          message,
          contactType: 'interest',
        }),
      });

      if (!response.ok) throw new Error();

      setIsSuccess(true);
      setEmail('');
      setMessage('');
    } catch {
      setError('No se pudo enviar el mensaje. Puedes escribirme directamente a itsasoarana@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-warm-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
            ¿Hablamos?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Si quieres consultar disponibilidad, encargar una pieza o proponer una colaboración, escríbeme por email o Instagram. Estaré encantada de atenderte.
          </p>
        </div>
      </section>

      {/* Contact Form + Instagram */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Form */}
            <div className="border border-gray-200 p-8">
              <div className="text-center mb-6">
                <Mail size={32} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-gray-500">itsasoarana@gmail.com</p>
              </div>

              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-green-600" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">Mensaje enviado</p>
                  <p className="text-sm text-gray-600">Te responderé lo antes posible.</p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Tu email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Cuéntame qué necesitas..."
                      className="w-full px-4 py-3 border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-800 text-white py-3 px-6 font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send size={16} />
                        Enviar mensaje
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Instagram */}
            <a
              href="https://instagram.com/its___arana"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 p-8 text-center hover:bg-warm-gray transition-colors group flex flex-col items-center justify-center"
            >
              <Instagram size={32} className="mb-4 text-gray-600 group-hover:text-gray-900" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Instagram</h3>
              <p className="text-gray-600">@its___arana</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
