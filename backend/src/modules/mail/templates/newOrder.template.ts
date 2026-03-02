
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
    subject: `Nueva orden recibida en ${data.storeName}`,
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
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .info-table th { background: #f1f5f9; color: #059669; font-size: 13px; padding: 10px; text-align: left; }
          .info-table td { color: #1e293b; font-size: 14px; padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
          .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
          .footer a { color: #059669; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="main">
          <div class="header">
            <h1>StoreHub</h1>
            <p>Panel de vendedor</p>
          </div>
          <div class="content">
            <div class="title">¡Nueva orden recibida!</div>
            <div class="subtitle">Has recibido una nueva orden en <strong>${data.storeName}</strong>.</div>
            <div class="summary">
              <p>Fecha: <strong>${formattedDate}</strong></p>
              <p>Número de orden: <span class="order-id">#${data.orderId}</span></p>
            </div>
            <h3 style="color:#059669; font-size:18px; margin-bottom:12px;">Detalle de la orden</h3>
            <table class="info-table">
              <tbody>
                <tr>
                  <td style="color:#64748b; font-size:13px; width:140px;">Tienda</td>
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
                  <td style="color:#059669; font-size:16px; font-weight:700;">${formattedTotal}</td>
                </tr>
              </tbody>
            </table>
            <div style="color:#64748b; font-size:15px; margin-bottom:18px;">
              Ingresá al panel de administración para ver el detalle completo y gestionar el estado de la orden.
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
