import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { TransportOptions } from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  reclamation: {
    id: number;
    nomClient: string;
    typeReclamation: string;
    statut: string;
    dateSoumission: string;
  };
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
} as TransportOptions);

export async function POST(req: Request) {
  try {
    const payload: EmailPayload = await req.json();
    const { to, subject, body, reclamation } = payload;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom right, #fff7ed, #ffe4e6); border-radius: 24px; border: 1px solid #fdba74;">
        <div style="background-color: #ea580c; color: white; padding: 16px; border-radius: 0 0 24px 24px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; text-align: center;">Banque Attijari</h1>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #fdba74;">
          <h2 style="color: #9a3412; margin-top: 0;">Détails de la Réclamation #${reclamation.id}</h2>
          <div style="margin-bottom: 16px;">
            <p style="margin: 8px 0;"><strong>Client:</strong> ${reclamation.nomClient}</p>
            <p style="margin: 8px 0;"><strong>Type:</strong> ${reclamation.typeReclamation}</p>
            <p style="margin: 8px 0;"><strong>Statut:</strong> 
              <span style="padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; 
                ${reclamation.statut === 'En attente' ? 'background-color: #fef9c3; color: #854d0e;' : 
                reclamation.statut === 'En cours' ? 'background-color: #fed7aa; color: #9a3412;' : 
                'background-color: #bbf7d0; color: #166534;'}">
                ${reclamation.statut}
              </span>
            </p>
            <p style="margin: 8px 0;"><strong>Date de soumission:</strong> ${reclamation.dateSoumission}</p>
          </div>
          
          <div style="border-top: 1px solid #fdba74; padding-top: 16px;">
            ${body.split('\n').map(line => `<p style="margin: 8px 0;">${line}</p>`).join('')}
          </div>
        </div>
        
        <div style="text-align: center; color: #9a3412; font-size: 14px;">
          <p>Ceci est un message automatique. Merci de ne pas y répondre directement.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 