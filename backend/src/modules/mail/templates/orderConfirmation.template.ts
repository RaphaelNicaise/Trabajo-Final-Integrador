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
    subject: `¡Gracias por tu compra en ${data.storeName}!`,
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
          .summary { background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 24px; margin-bottom: 32px; }
          .summary p { margin: 0 0 8px; color: #64748b; font-size: 15px; }
          .order-id { font-family: monospace; color: #059669; font-size: 16px; font-weight: 700; }
          .products-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .products-table th { background: #f1f5f9; color: #059669; font-size: 13px; padding: 10px; text-align: left; }
          .products-table td { color: #1e293b; font-size: 14px; padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .totals-table { width: 100%; margin-bottom: 24px; }
          .totals-table td { font-size: 15px; padding: 6px 0; }
          .totals-table .label { color: #64748b; }
          .totals-table .value { color: #059669; text-align: right; font-weight: 600; }
          .address-block { background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 18px; margin-bottom: 32px; }
          .address-block p { margin: 0 0 6px; color: #1e293b; font-size: 15px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
          .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
          .footer a { color: #059669; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="main">
          <div class="header">
            <h1>StoreHub</h1>
            <p>Confirmación de compra</p>
          </div>
          <div class="content">
            <div class="title">¡Gracias por tu compra!</div>
            <div class="subtitle">Estimado/a <strong>${data.buyerName}</strong>,<br>Tu pedido en <strong>${data.storeName}</strong> ha sido recibido y procesado correctamente.</div>
            <div class="summary">
              <p>Fecha de compra: <strong>${formattedDate}</strong></p>
              <p>Número de orden: <span class="order-id">#${data.orderId}</span></p>
            </div>
            <h3 style="color:#059669; font-size:18px; margin-bottom:12px;">Detalle de productos</h3>
            <table class="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal productos</td>
                <td class="value">$${data.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Costo de envío</td>
                <td class="value">$${data.shippingCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label" style="font-size:17px; font-weight:700;">Total a pagar</td>
                <td class="value" style="font-size:17px; font-weight:700;">${formattedTotal}</td>
              </tr>
            </table>
            <div class="address-block">
              <p><strong>Dirección de entrega</strong></p>
              <p>${data.address} ${data.streetNumber}</p>
              <p>${data.city}, ${data.province}</p>
              <p>CP: ${data.postalCode}</p>
              <p style="color:#059669; font-weight:600;">Entrega estimada: ${data.estimatedDays} días hábiles</p>
            </div>
            <div style="color:#64748b; font-size:15px; margin-bottom:18px;">
              Pronto recibirás una notificación cuando tu pedido sea despachado.<br>
              Si tienes alguna consulta o necesitas asistencia, puedes responder a este correo o contactar directamente a la tienda.
            </div>
            <div style="color:#059669; font-size:15px; font-weight:600; margin-bottom:18px;">
              ¡Gracias por confiar en StoreHub!
            </div>
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
