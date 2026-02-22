interface NewOrderTemplateData {
  orderId: string;
  storeName: string;
  buyerName: string;
  buyerEmail: string;
  total: number;
  itemCount: number;
  createdAt: Date;
}

export const newOrderTemplate = (data: NewOrderTemplateData) => {
  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(data.total);

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(data.createdAt);

  return {
    subject: ` Nueva orden recibida en ${data.storeName}`,
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
                    <p style="margin:4px 0 0; color:#bfdbfe; font-size:13px;">Panel de vendedor</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 8px; color:#1e293b; font-size:20px;">🛒 ¡Nueva orden recibida!</h2>
                    <p style="margin:0 0 24px; color:#64748b; font-size:14px;">${formattedDate}</p>

                    <!-- Order info card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px;">
                          <table width="100%" cellpadding="6" cellspacing="0">
                            <tr>
                              <td style="color:#64748b; font-size:13px; width:140px;">ID de orden</td>
                              <td style="color:#1e293b; font-size:13px; font-family:monospace; font-weight:600;">#${data.orderId}</td>
                            </tr>
                            <tr>
                              <td style="color:#64748b; font-size:13px;">Tienda</td>
                              <td style="color:#1e293b; font-size:13px; font-weight:600;">${data.storeName}</td>
                            </tr>
                            <tr>
                              <td style="color:#64748b; font-size:13px;">Comprador</td>
                              <td style="color:#1e293b; font-size:13px;">${data.buyerName}</td>
                            </tr>
                            <tr>
                              <td style="color:#64748b; font-size:13px;">Email comprador</td>
                              <td style="color:#1e293b; font-size:13px;">${data.buyerEmail}</td>
                            </tr>
                            <tr>
                              <td style="color:#64748b; font-size:13px;">Productos</td>
                              <td style="color:#1e293b; font-size:13px;">${data.itemCount} ${data.itemCount === 1 ? 'artículo' : 'artículos'}</td>
                            </tr>
                            <tr>
                              <td style="color:#64748b; font-size:13px;">Total</td>
                              <td style="color:#16a34a; font-size:16px; font-weight:700;">${formattedTotal}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0; color:#64748b; font-size:13px; line-height:1.6;">
                      Ingresá al panel de administración para ver el detalle completo y gestionar el estado de la orden.
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
