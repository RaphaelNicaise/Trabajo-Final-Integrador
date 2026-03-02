
interface PasswordResetTemplateData {
  userName: string;
  resetLink: string;
}

export const passwordResetTemplate = (data: PasswordResetTemplateData) => {
  return {
    subject: 'Restablecer tu contraseña - StoreHub',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { background: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif; }
          .main { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 600px; margin: 40px auto; overflow: hidden; }
          .header { background: linear-gradient(90deg, #059669 60%, #34d399 100%); padding: 32px 40px; text-align: left; }
          .header h1 { color: #fff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px; }
          .header p { color: #d1fae5; font-size: 15px; margin: 8px 0 0; }
          .content { padding: 40px; }
          .title { color: #059669; font-size: 22px; font-weight: 600; margin-bottom: 12px; }
          .subtitle { color: #1e293b; font-size: 16px; margin-bottom: 24px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
          .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
          .footer a { color: #059669; text-decoration: underline; }
          .cta-btn { display:inline-block; background-color:#059669; color:#fff; padding:14px 32px; font-size:15px; font-weight:600; text-decoration:none; border-radius:6px; margin-bottom:24px; }
          .link-block { color:#059669; font-size:13px; word-break:break-all; margin:8px 0 0; }
        </style>
      </head>
      <body>
        <div class="main">
          <div class="header">
            <h1>StoreHub</h1>
            <p>Recuperar contraseña</p>
          </div>
          <div class="content">
            <div class="title">Restablecer contraseña</div>
            <div class="subtitle">Hola <strong>${data.userName}</strong>,<br>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva contraseña. Este enlace expira en 1 hora.</div>
            <div style="text-align:center;">
              <a href="${data.resetLink}" class="cta-btn">Restablecer Contraseña</a>
            </div>
            <div style="color:#64748b; font-size:14px; margin:24px 0 8px;">
              Si no solicitaste este cambio, podés ignorar este correo. Tu contraseña no será modificada.
            </div>
            <div style="color:#94a3b8; font-size:13px;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</div>
            <div class="link-block">${data.resetLink}</div>
          </div>
          <div class="footer">
            <p>Este correo fue generado automáticamente por StoreHub.<br>
            Si tienes dudas, visita nuestro <a href="https://storehub.com/soporte">Centro de Ayuda</a>.<br>
            No respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};
