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
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color:#2563eb; padding:28px 32px;">
                    <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">StoreHub</h1>
                    <p style="margin:4px 0 0; color:#bfdbfe; font-size:13px;">Recuperar contraseña</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 8px; color:#1e293b; font-size:20px;">🔑 Restablecer contraseña</h2>
                    <p style="margin:0 0 16px; color:#64748b; font-size:14px; line-height:1.6;">
                      Hola <strong>${data.userName}</strong>,
                    </p>
                    <p style="margin:0 0 24px; color:#64748b; font-size:14px; line-height:1.6;">
                      Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva contraseña. Este enlace expira en 1 hora.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${data.resetLink}" style="display:inline-block; background-color:#2563eb; color:#ffffff; padding:14px 32px; font-size:15px; font-weight:600; text-decoration:none; border-radius:6px;">
                            Restablecer Contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px; color:#94a3b8; font-size:12px; line-height:1.6;">
                      Si no solicitaste este cambio, podés ignorar este correo. Tu contraseña no será modificada.
                    </p>
                    <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                      Si el botón no funciona, copiá y pegá este enlace en tu navegador:
                    </p>
                    <p style="margin:4px 0 0; color:#2563eb; font-size:11px; word-break:break-all;">
                      ${data.resetLink}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:16px 32px;">
                    <p style="margin:0; color:#94a3b8; font-size:12px; text-align:center;">
                      Este correo fue generado automáticamente por StoreHub · No respondas a este mensaje
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};
