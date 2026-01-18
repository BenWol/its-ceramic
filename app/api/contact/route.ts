import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, subject, message, productName, contactType } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // For now, we'll log the contact request
    // In production, you'd integrate with an email service like:
    // - Resend (resend.com)
    // - SendGrid
    // - Nodemailer with SMTP
    // - Or a form service like Formspree

    console.log('=== New Contact Request ===');
    console.log('From:', email);
    console.log('Subject:', subject);
    console.log('Product:', productName);
    console.log('Type:', contactType);
    console.log('Message:', message);
    console.log('===========================');

    // TODO: Implement actual email sending
    // Example with Resend:
    //
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    //
    // await resend.emails.send({
    //   from: 'its ceramic <noreply@itsceramic.com>',
    //   to: 'itsasoarana@gmail.com',
    //   replyTo: email,
    //   subject: subject,
    //   text: `De: ${email}\n\n${message}`,
    // });

    // For now, simulate success
    // Remove this delay in production
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
