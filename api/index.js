import { Hono } from 'hono';
import * as brevo from '@getbrevo/brevo';
import { handle } from 'hono/vercel';

const Brevo = new brevo.TransactionalEmailsApi();
Brevo.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.API_KEY ?? ''
);

const sendEmail = new brevo.SendSmtpEmail();

const app = new Hono().basePath('/api')

app.post('/send', async c => {
  try {
    const body = await c.req.json();
    sendEmail.subject = `Propuesta de ${body['senderName']}`;
    sendEmail.sender = {
      email: process.env.SENDER_EMAIL ?? '',
      name: body['senderName'],
    };
    sendEmail.to = [{ email: process.env.TO_SEND_EMAIL ?? '' }];
    sendEmail.htmlContent = `
    <html>
      <head>
        <title>Email Template</title>
      </head>
      <body>
        <h1>Enviado por ${body['senderName']} - ${body['senderEmail']}</h1>
        <h3>Servicios que quiere: ${body['services'].join(', ')}</h3>
        <h4>${body['message']}</h4>
      </body>
    </html>
  `;
    await Brevo.sendTransacEmail(sendEmail);

    return c.json({ message: 'Email Sended' }, 200);
  } catch (error) {
    const err = error
    return c.json(
      {
        error: {
          status: err.response.statusCode,
          message: err.response.body.message,
        },
      },
      500
    );
  }
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;