interface ShopInvitationTemplateData {
  userName: string;
  shopName: string;
  ownerName: string;
  acceptLink: string;
}

export const shopInvitationTemplate = (data: ShopInvitationTemplateData) => {
  return {
    subject: `Te invitaron a administrar "${data.shopName}" - StoreHub`,
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
                  <td style="background-color:#7c3aed; padding:28px 32px;">
                    <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">StoreHub</h1>
                    <p style="margin:4px 0 0; color:#ddd6fe; font-size:13px;">Invitación a tienda</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 8px; color:#1e293b; font-size:20px;">🏪 ¡Te invitaron a una tienda!</h2>
                    <p style="margin:0 0 16px; color:#64748b; font-size:14px; line-height:1.6;">
                      Hola <strong>${data.userName}</strong>,
                    </p>
                    <p style="margin:0 0 24px; color:#64748b; font-size:14px; line-height:1.6;">
                      <strong>${data.ownerName}</strong> te invitó a ser administrador de la tienda <strong>"${data.shopName}"</strong>. 
                      Hacé clic en el botón de abajo para aceptar la invitación.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${data.acceptLink}" style="display:inline-block; background-color:#7c3aed; color:#ffffff; padding:14px 32px; font-size:15px; font-weight:600; text-decoration:none; border-radius:6px;">
                            Aceptar Invitación
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px; color:#94a3b8; font-size:12px; line-height:1.6;">
                      Si no esperabas esta invitación, podés ignorar este correo.
                    </p>
                    <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                      Si el botón no funciona, copiá y pegá este enlace en tu navegador:
                    </p>
                    <p style="margin:4px 0 0; color:#7c3aed; font-size:11px; word-break:break-all;">
                      ${data.acceptLink}
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
