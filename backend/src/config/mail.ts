import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || '587');
const MAIL_USER = process.env.MAIL_USER || '';
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || '';

const transportOptions: SMTPTransport.Options = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true para puerto 465, false para otros
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
};

export const transporter = nodemailer.createTransport(transportOptions);

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Conexión SMTP establecida');
  } catch (error) {
    console.error('Mailer: Error en configuración SMTP:', error);
  }
};