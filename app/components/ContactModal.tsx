'use client';

import { useState, useEffect } from 'react';
import { X, Send, Check } from 'lucide-react';

export type ContactType = 'interest' | 'encargo';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  contactType: ContactType;
};

export default function ContactModal({
  isOpen,
  onClose,
  productName,
  contactType,
}: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Set default message based on contact type
  useEffect(() => {
    if (isOpen) {
      if (contactType === 'interest') {
        setMessage(`Hola,\n\nMe interesa la pieza "${productName}".\n\nMe gustaría saber más sobre disponibilidad y opciones de envío.\n\nGracias.`);
      } else {
        setMessage(`Hola,\n\nMe gustaría encargar la pieza "${productName}".\n\nPor favor, cuéntame más sobre el proceso y los plazos.\n\nGracias.`);
      }
      setIsSuccess(false);
      setError('');
    }
  }, [isOpen, productName, contactType]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, introduce tu email.');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, introduce un email válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = contactType === 'interest'
        ? `Interés en: ${productName}`
        : `Encargo: ${productName}`;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject,
          message,
          productName,
          contactType,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setEmail('');
        setMessage('');
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      setError('No se pudo enviar el mensaje. Por favor, intenta de nuevo o escríbeme directamente a contact@its-ceramic.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const title = contactType === 'interest'
    ? 'Me interesa esta pieza'
    : 'Solicitar encargo';

  const subtitle = contactType === 'interest'
    ? 'Escríbeme y te cuento todos los detalles.'
    : 'Esta pieza se realiza bajo encargo. Cuéntame qué necesitas.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Mensaje enviado
            </h3>
            <p className="text-sm text-gray-600">
              Te responderé lo antes posible.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {subtitle}
            </p>

            {/* Email */}
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

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 text-sm text-gray-800 focus:border-gray-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-800 text-white py-4 px-6 font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send size={18} />
                  Enviar mensaje
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              También puedes escribirme directamente a{' '}
              <a href="mailto:contact@its-ceramic.com" className="underline">
                contact@its-ceramic.com
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
