interface OrderConfirmationData {
  orderId: string;
  storeName: string;
  buyerName: string;
  products: { name: string; price: number; quantity: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  address: string;
  streetNumber: string;
  city: string;
  province: string;
  postalCode: string;
  estimatedDays: number;
  createdAt: Date;
}

export const orderConfirmationTemplate = (data: OrderConfirmationData) => {
  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(data.total);

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(data.createdAt);

  const productRows = data.products
    .map(
      (p) => `
      <tr>
        <td style="padding:8px 12px; color:#1e293b; font-size:13px; border-bottom:1px solid #f1f5f9;">${p.name}</td>
        <td style="padding:8px 12px; color:#1e293b; font-size:13px; text-align:center; border-bottom:1px solid #f1f5f9;">${p.quantity}</td>
        <td style="padding:8px 12px; color:#1e293b; font-size:13px; text-align:right; border-bottom:1px solid #f1f5f9;">$${(p.price * p.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return {
    subject: `Confirmación de tu orden en ${data.storeName}`,
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
                  <td style="background-color:#059669; padding:28px 32px;">
                    <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">StoreHub</h1>
                    <p style="margin:4px 0 0; color:#d1fae5; font-size:13px;">Confirmación de orden</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 8px; color:#1e293b; font-size:20px;">✅ ¡Tu orden fue confirmada!</h2>
                    <p style="margin:0 0 4px; color:#64748b; font-size:14px;">Hola <strong>${data.buyerName}</strong>, tu compra en <strong>${data.storeName}</strong> fue procesada con éxito.</p>
                    <p style="margin:0 0 24px; color:#64748b; font-size:13px;">${formattedDate}</p>

                    <!-- Datos de la orden -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 4px; color:#64748b; font-size:12px;">Número de orden</p>
                          <p style="margin:0; color:#1e293b; font-size:14px; font-family:monospace; font-weight:600;">#${data.orderId}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Productos -->
                    <h3 style="margin:0 0 12px; color:#1e293b; font-size:16px;">Productos</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:6px; overflow:hidden; margin-bottom:24px;">
                      <thead>
                        <tr style="background-color:#f8fafc;">
                          <th style="padding:10px 12px; color:#64748b; font-size:12px; text-align:left; text-transform:uppercase;">Producto</th>
                          <th style="padding:10px 12px; color:#64748b; font-size:12px; text-align:center; text-transform:uppercase;">Cant.</th>
                          <th style="padding:10px 12px; color:#64748b; font-size:12px; text-align:right; text-transform:uppercase;">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${productRows}
                      </tbody>
                    </table>

                    <!-- Totales -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="padding:4px 0; color:#64748b; font-size:13px;">Subtotal productos</td>
                        <td style="padding:4px 0; color:#1e293b; font-size:13px; text-align:right;">$${data.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; color:#64748b; font-size:13px;">Envío</td>
                        <td style="padding:4px 0; color:#1e293b; font-size:13px; text-align:right;">$${data.shippingCost.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0 0; color:#1e293b; font-size:16px; font-weight:700; border-top:2px solid #e2e8f0;">Total</td>
                        <td style="padding:8px 0 0; color:#059669; font-size:16px; font-weight:700; text-align:right; border-top:2px solid #e2e8f0;">${formattedTotal}</td>
                      </tr>
                    </table>

                    <!-- Dirección -->
                    <h3 style="margin:0 0 12px; color:#1e293b; font-size:16px;">📍 Dirección de envío</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 4px; color:#1e293b; font-size:14px;">${data.address} ${data.streetNumber}</p>
                          <p style="margin:0 0 4px; color:#64748b; font-size:13px;">${data.city}, ${data.province}</p>
                          <p style="margin:0 0 8px; color:#64748b; font-size:13px;">CP: ${data.postalCode}</p>
                          <p style="margin:0; color:#059669; font-size:13px; font-weight:600;">Entrega estimada: ${data.estimatedDays} días hábiles</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0; color:#64748b; font-size:13px; line-height:1.6;">
                      Te enviaremos un aviso cuando tu pedido sea despachado. Si tenés alguna consulta, contactá directamente a la tienda.
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
