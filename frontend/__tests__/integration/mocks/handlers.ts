import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

export const handlers = [
  // ── AUTH HANDLERS ─────────────────────────────────────────────────────────
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any;

    // Simulamos error si el email ya existe
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      _id: 'user-123',
      name: body.name,
      email: body.email,
      isConfirmed: false,
      message: 'Revisa tu correo para confirmar tu cuenta',
    });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any;

    // Simulamos error si las credenciales son inválidas
    if (body.password !== 'password123') {
      return HttpResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (body.email === 'unconfirmed@example.com') {
      return HttpResponse.json(
        { message: 'Cuenta no confirmada' },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        _id: 'user-123',
        name: 'Test User',
        email: body.email,
      },
    });
  }),

  http.get(`${API_URL}/auth/confirm/:token`, () => {
    return HttpResponse.json({
      message: 'Cuenta confirmada exitosamente',
      user: {
        _id: 'user-123',
        email: 'test@example.com',
        isConfirmed: true,
      },
    });
  }),

  http.post(`${API_URL}/auth/forgot-password`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json({
      message: 'Revisa tu correo para restablecer tu contraseña',
      email: body.email,
    });
  }),

  http.post(`${API_URL}/auth/reset-password/:token`, async ({ request }) => {
    return HttpResponse.json({
      message: 'Contraseña restablecida exitosamente',
    });
  }),

  http.post(`${API_URL}/shops/invitations/:token/accept`, () => {
    return HttpResponse.json({
      message: 'Invitación aceptada',
      shop: {
        _id: 'shop-123',
        name: 'Tienda del Amigo',
        slug: 'tienda-amigo',
      },
    });
  }),

  // ── PRODUCTS HANDLERS ─────────────────────────────────────────────────────
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json([
      {
        _id: 'prod-1',
        name: 'Producto 1',
        description: 'Descripción del producto 1',
        price: 100,
        stock: 50,
        status: 'Disponible',
        categories: ['cat-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'prod-2',
        name: 'Producto 2',
        description: 'Descripción del producto 2',
        price: 200,
        stock: 0,
        status: 'Agotado',
        categories: ['cat-1', 'cat-2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    return HttpResponse.json({
      _id: params.id,
      name: `Producto ${params.id}`,
      description: 'Descripción del producto',
      price: 150,
      stock: 25,
      status: 'Disponible',
      categories: ['cat-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/products`, async ({ request }) => {
    return HttpResponse.json(
      {
        _id: 'prod-new',
        name: 'Nuevo Producto',
        description: 'Descripción',
        price: 100,
        stock: 10,
        status: 'Disponible',
        categories: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/products/:id`, async ({ request }) => {
    return HttpResponse.json({
      _id: 'prod-1',
      name: 'Producto Actualizado',
      description: 'Descripción actualizada',
      price: 150,
      stock: 20,
      status: 'Disponible',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/products/:id`, () => {
    return HttpResponse.json({
      message: 'Producto eliminado exitosamente',
    });
  }),

  http.put(`${API_URL}/products/:id/promotion`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json({
      _id: 'prod-1',
      name: 'Producto con promoción',
      promotion: {
        tipo: body.tipo,
        valor: body.valor,
        activa: body.activa !== false,
      },
    });
  }),

  http.delete(`${API_URL}/products/:id/promotion`, () => {
    return HttpResponse.json({
      message: 'Promoción eliminada',
      promotion: null,
    });
  }),

  // ── CATEGORIES HANDLERS ───────────────────────────────────────────────────
  http.get(`${API_URL}/categories`, () => {
    return HttpResponse.json([
      {
        _id: 'cat-1',
        name: 'Categoría 1',
        slug: 'categoria-1',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'cat-2',
        name: 'Categoría 2',
        slug: 'categoria-2',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post(`${API_URL}/categories`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json(
      {
        _id: 'cat-new',
        name: body.name,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // ── SHOPS HANDLERS ────────────────────────────────────────────────────────
  http.get(`${API_URL}/shops/:slug`, ({ params }) => {
    return HttpResponse.json({
      _id: 'shop-123',
      name: 'Mi Tienda',
      slug: params.slug,
      description: 'Descripción de la tienda',
      logo: null,
      owner: 'user-123',
      createdAt: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/shops`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json(
      {
        _id: 'shop-new',
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        owner: 'user-123',
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // ── ORDERS HANDLERS ───────────────────────────────────────────────────────
  http.get(`${API_URL}/orders`, () => {
    return HttpResponse.json([
      {
        _id: 'order-1',
        total: 500,
        status: 'Confirmado',
        items: [{ productId: 'prod-1', quantity: 5 }],
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get(`${API_URL}/orders/:id`, ({ params }) => {
    return HttpResponse.json({
      _id: params.id,
      total: 500,
      status: 'Confirmado',
      items: [{ productId: 'prod-1', quantity: 5 }],
      createdAt: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/orders`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json(
      {
        _id: 'order-new',
        total: body.total,
        status: 'Pendiente',
        items: body.products,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/orders/:id`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json({
      _id: 'order-1',
      status: body.status,
      message: 'Estado actualizado',
    });
  }),

  http.post(`${API_URL}/orders/shipping-quote`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json({
      cost: 1500,
      estimatedDays: 3,
      method: 'Standard',
      province: body.province,
      postalCode: body.postalCode,
    });
  }),

  http.get(`${API_URL}/orders/:id/pdf`, async () => {
    const mockPdf = new Blob(['PDF content'], { type: 'application/pdf' });
    return HttpResponse.arrayBuffer(await mockPdf.arrayBuffer(), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=orden.pdf',
      },
    });
  }),

  // ── CONFIGURATIONS HANDLERS ───────────────────────────────────────────────
  http.get(`${API_URL}/configurations`, () => {
    return HttpResponse.json({
      siteName: 'StoreHub',
      siteDescription: 'Tu plataforma de e-commerce',
      contactEmail: 'contact@storehub.com',
    });
  }),
];
