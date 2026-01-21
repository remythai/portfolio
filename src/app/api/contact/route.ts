import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Utilise ton domaine vérifié
      to: 'thairemy0@gmail.com', // Ton email où recevoir les messages
      replyTo: email,
      subject: `Nouveau message de ${name}`,
      html: `
        <h2>Nouveau message du formulaire de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email envoyé avec succès!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}
