import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const CREATOR_EMAIL = 'contact@its-ceramic.com';

export async function POST(req: Request) {
  try {
    const { email, subject, message, productName, contactType } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    const contactTypeLabel = contactType === 'encargo' ? 'Encargo personalizado' : 'Interés en pieza';

    // Email to the creator
    await resend.emails.send({
      from: 'its ceramic <contact@its-ceramic.com>',
      to: CREATOR_EMAIL,
      replyTo: email,
      subject: subject || `Nueva consulta: ${contactTypeLabel}`,
      text: `Nueva consulta de contacto

De: ${email}
Tipo: ${contactTypeLabel}
${productName ? `Pieza: ${productName}` : ''}

Mensaje:
${message}

---
Puedes responder directamente a este email para contactar con ${email}`,
    });

    // Confirmation email to the customer
    await resend.emails.send({
      from: 'its ceramic <contact@its-ceramic.com>',
      to: email,
      subject: 'Hemos recibido tu mensaje - its ceramic',
      text: `¡Hola!

Gracias por ponerte en contacto con its ceramic. Hemos recibido tu mensaje y te responderemos lo antes posible.

Tu consulta:
${message}

${productName ? `Pieza de interés: ${productName}` : ''}

---
its ceramic
Instagram: @its___arana
Email: contact@its-ceramic.com`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
