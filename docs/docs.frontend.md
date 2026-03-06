# Documentacion Frontend - StoreHub

- [Stack](#stack)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Rutas](#rutas)
- [Arquitectura de Estado](#arquitectura-de-estado)
- [Componentes](#componentes)
- [Layouts](#layouts)
- [Vistas Publicas](#vistas-publicas)
- [Vistas Admin](#vistas-admin)
- [Servicios](#servicios)
- [Sistema de Diseño](#sistema-de-diseño)

---

## Stack

- **Next.js 15** con App Router (`app/`) y `output: 'standalone'` para Docker
- **React 19** — todo el arbol marcado como `'use client'` (sin SSR por la dependencia de `localStorage`)
- **TypeScript 5**
- **Tailwind CSS v4** con tema personalizado en `globals.css`
- **Material UI 7** para componentes de admin (tablas, modales, inputs)
- **Axios** con interceptores automaticos de autenticacion, tenant y API key
- **Framer Motion** para animaciones de transicion
- **Lucide React** para iconografia

---

## Estructura del Proyecto

```
frontend/src/
├── app/                          # Rutas (Next.js App Router)
│   ├── layout.tsx                # Layout raiz (AuthProvider + CartProvider)
│   ├── page.tsx                  # Ruta / → PublicStoresPage
│   ├── globals.css               # Tailwind + variables CSS del tema
│   ├── login/
│   ├── register/
│   ├── confirmar-cuenta/
│   ├── recuperar-contrasena/
│   ├── restablecer-contrasena/
│   ├── aceptar-invitacion/
│   ├── tienda/[slug]/            # Tienda publica
│   ├── checkout/[slug]/          # Proceso de compra
│   └── admin/                    # Panel de administracion
│       ├── page.tsx
│       ├── dashboard/
│       ├── tiendas/
│       ├── productos/
│       ├── categorias/
│       ├── ordenes/
│       ├── configuracion/
│       ├── promociones/
│       └── usuarios/
├── components/
│   ├── layout/
│   │   ├── PublicNavbar.tsx      # Navbar de las paginas publicas
│   │   └── AdminSidebar.tsx      # Sidebar del panel admin
│   ├── ui/
│   │   └── Select.tsx            # Select reutilizable
│   ├── FloatingCart.tsx          # Carrito flotante con panel deslizante
│   ├── PageHeader.tsx            # Cabecera de pagina reutilizable
│   ├── PrivateRoute.tsx          # Guard de autenticacion
│   └── ShopGuard.tsx             # Guard de tienda activa seleccionada
├── contexts/
│   ├── AuthContext.tsx           # Sesion de usuario y tienda activa
│   └── CartContext.tsx           # Estado del carrito con polling de stock
├── layouts/
│   └── AdminLayout.tsx           # Layout de dos columnas (sidebar + main)
├── services/
│   ├── api.ts                    # Instancia Axios con interceptores
│   ├── auth.service.ts
│   ├── shops.service.ts
│   ├── products.service.ts
│   ├── categories.service.ts
│   ├── orders.service.ts
│   ├── configurations.service.ts
│   ├── georef.service.ts
│   └── index.ts                  # Re-exporta todos los servicios
└── views/
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── PublicStoresPage.tsx
    ├── PublicStorePage.tsx
    ├── CheckoutPage.tsx
    └── admin/
        ├── Dashboard.tsx
        ├── Tiendas.tsx
        ├── Productos.tsx
        ├── Categorias.tsx
        ├── Ordenes.tsx
        ├── Configuracion.tsx
        ├── Promociones.tsx
        └── Usuarios.tsx
```

---

## Rutas

| Ruta | Vista | Acceso |
|------|-------|--------|
| `/` | `PublicStoresPage` | Publico |
| `/tienda/[slug]` | `PublicStorePage` | Publico |
| `/checkout/[slug]` | `CheckoutPage` | Publico |
| `/login` | `LoginPage` | Publico |
| `/register` | `RegisterPage` | Publico |
| `/confirmar-cuenta` | — | Publico (token via query param) |
| `/recuperar-contrasena` | — | Publico |
| `/restablecer-contrasena` | — | Publico (token via query param) |
| `/aceptar-invitacion` | — | Publico (token via query param) |
| `/admin` | `DashboardPage` | Privado (`PrivateRoute`) |
| `/admin/tiendas` | `TiendasPage` | Privado |
| `/admin/dashboard` | `DashboardPage` | Privado + tienda activa (`ShopGuard`) |
| `/admin/productos` | `ProductosPage` | Privado + tienda activa |
| `/admin/categorias` | `CategoriasPage` | Privado + tienda activa |
| `/admin/ordenes` | `OrdenesPage` | Privado + tienda activa |
| `/admin/configuracion` | `ConfiguracionPage` | Privado + tienda activa |
| `/admin/promociones` | `PromocionesPage` | Privado + tienda activa |
| `/admin/usuarios` | `UsuariosPage` | Privado + tienda activa |

---

## Arquitectura de Estado

### Layout Raiz

Toda la aplicacion esta envuelta en dos providers anidados definidos en [`app/layout.tsx`](../frontend/src/app/layout.tsx):

```tsx
<AuthProvider>
  <CartProvider>
    {children}
  </CartProvider>
</AuthProvider>
```

La app esta marcada como `'use client'` globalmente porque los contextos dependen de `localStorage` para persistir sesion y carrito.

---

### AuthContext — [`contexts/AuthContext.tsx`](../frontend/src/contexts/AuthContext.tsx)

Gestiona la sesion del usuario y la tienda actualmente seleccionada para administrar.

| Propiedad / Metodo | Tipo | Descripcion |
|--------------------|------|-------------|
| `user` | `User \| null` | Usuario autenticado (`id`, `name`, `email`) |
| `token` | `string \| null` | JWT de sesion |
| `activeShop` | `Shop \| null` | Tienda activa en admin (`id`, `slug`, `name`, `role`) |
| `authLoading` | `boolean` | `true` mientras se restaura sesion desde `localStorage` |
| `isAuthenticated` | `boolean` | `true` si hay `token` y `user` |
| `login(user, token)` | funcion | Guarda sesion en estado y `localStorage` |
| `logout()` | funcion | Limpia sesion y tienda activa de estado y `localStorage` |
| `selectShop(shop)` | funcion | Establece la tienda activa para operar en el admin |
| `clearActiveShop()` | funcion | Limpia la tienda activa |

**Persistencia:** Al montar lee `token`, `user` y `activeShop` de `localStorage`. `authLoading` es `true` hasta que termine esta restauracion para evitar flashes de redireccion.

**Acceso:** `useAuth()` — lanza error si se usa fuera del `AuthProvider`.

---

### CartContext — [`contexts/CartContext.tsx`](../frontend/src/contexts/CartContext.tsx)

Gestiona el estado del carrito con persistencia en `localStorage` y polling de stock en tiempo real.

| Propiedad / Metodo | Descripcion |
|--------------------|-------------|
| `items` | Array de productos en el carrito |
| `addItem(item, qty?)` | Agrega un producto respetando el limite de stock |
| `removeItem(productId)` | Elimina un producto del carrito |
| `updateQuantity(productId, qty)` | Actualiza cantidad; si `qty <= 0` elimina el item |
| `clearCart()` | Vacia el carrito completo |
| `getTotal()` | Suma todos los items con promociones aplicadas |
| `getItemCount()` | Suma total de unidades en el carrito |
| `stockWarnings` | Advertencias cuando el stock de un producto cambia |
| `clearStockWarnings()` | Limpia las advertencias de stock |

**Polling de stock:** Cada 30 segundos (primer poll a los 5 s) consulta `GET /products?public=true` por cada `shopSlug` unico en el carrito. Si un producto queda sin stock se elimina; si la cantidad supera el stock disponible se reduce. Los cambios se notifican via `FloatingCart` con un banner de advertencia.

**Calculo de precios:** Las funciones `calculateItemTotal(item)` y `calculateUnitPrice(price, promo)` se exportan desde el contexto y soportan promociones tipo `porcentaje`, `fijo` y `nxm`.

**Acceso:** `useCart()` — lanza error si se usa fuera del `CartProvider`.

---

## Componentes

### FloatingCart — [`components/FloatingCart.tsx`](../frontend/src/components/FloatingCart.tsx)

Boton flotante fijo en la esquina inferior derecha que abre un panel lateral deslizante con el contenido completo del carrito.

**Estructura del panel:**
1. **Boton flotante** — se oculta si el carrito esta vacio; badge rojo con el total de unidades
2. **Panel deslizante** con overlay oscuro:
   - Header: "Tu Carrito" + cantidad de productos
   - Banner de advertencias de stock (con icono `AlertTriangle` para productos eliminados o reducidos)
   - Lista de items: imagen, nombre, tienda, badge de promocion, precio original tachado + precio final, controles +/- y boton eliminar
   - Footer: total acumulado + boton "Proceder al Checkout" (enlaza a `/checkout/[shopSlug]`) + boton "Vaciar carrito"

### PrivateRoute — [`components/PrivateRoute.tsx`](../frontend/src/components/PrivateRoute.tsx)

Guard de autenticacion. Si `isAuthenticated` es `false` redirige a `/login` con `router.replace()`. Renderiza `null` mientras redirige para evitar flash de contenido protegido.

### ShopGuard — [`components/ShopGuard.tsx`](../frontend/src/components/ShopGuard.tsx)

Guard de tienda activa. Si `activeShop` es `null` y la ruta actual no es `/admin` ni `/admin/tiendas`, redirige a `/admin/tiendas` para que el usuario seleccione una tienda antes de operar. Todas las rutas admin excepto Tiendas requieren este guard.

### PageHeader — [`components/PageHeader.tsx`](../frontend/src/components/PageHeader.tsx)

Cabecera reutilizable en todas las vistas del admin. Acepta titulo, descripcion opcional y un slot de acciones (botones).

---

## Layouts

### AdminLayout — [`layouts/AdminLayout.tsx`](../frontend/src/layouts/AdminLayout.tsx)

Layout de dos columnas para el panel admin:

- **Desktop:** sidebar izquierdo siempre visible (`md:sticky`, `h-screen`) + area principal con scroll independiente
- **Mobile:** sidebar oculto por defecto, se abre con boton hamburguesa (`fixed top-4 left-4`) sobre un overlay semitransparente

El area principal tiene `max-w-7xl mx-auto` con padding adaptativo por breakpoint.

---

## Vistas Publicas

### PublicStoresPage — [`views/PublicStoresPage.tsx`](../frontend/src/views/PublicStoresPage.tsx)

Pagina principal (`/`). Catalogo de todas las tiendas de la plataforma.

- Carga tiendas con `shopsService.getAllShops()`
- Filtro por nombre/descripcion (busqueda libre)
- Filtro por categoria (10 predefinidas: Alimentos, Ropa, Tecnologia, Hogar, Salud, Deportes, Mascotas, Arte, Servicios, Otros)
- Filtrado reactivo con `useMemo`
- Cards con enlace a `/tienda/[slug]`

### PublicStorePage — [`views/PublicStorePage.tsx`](../frontend/src/views/PublicStorePage.tsx)

Pagina publica de una tienda individual (`/tienda/[slug]`).

- Carga productos disponibles con stock > 0 via `productsService.getPublicAll()`
- Carga categorias, datos de la tienda y configuraciones publicas (monto minimo de compra, umbral de envio gratis)
- Filtros: busqueda por texto + filtro por categoria
- Muestra precio original tachado y precio final con promocion aplicada (`calculateFinalPrice`, `getPromoBadgeText`)
- Botones "Agregar al carrito" con validacion de stock en tiempo real
- Incluye `FloatingCart` y `PublicNavbar`

### CheckoutPage — [`views/CheckoutPage.tsx`](../frontend/src/views/CheckoutPage.tsx)

Proceso de compra en 4 pasos para los productos de una tienda especifica (`/checkout/[slug]`).

| Paso | Datos |
|------|-------|
| 1. Datos | Nombre completo, email, telefono del comprador |
| 2. Envio | Provincia (API Georef), localidad, direccion, codigo postal, notas. Muestra cotizacion del envio |
| 3. Pago | Datos mock de tarjeta (numero, titular, vencimiento, CVV) |
| 4. Confirmar | Resumen con subtotal, envio y total. Boton "Confirmar Pedido" |

Al confirmar llama a `ordersService.createOrder()`. Si el carrito de la tienda esta vacio redirige a `/tienda/[slug]`. Lee `minPurchaseAmount` y `freeShippingThreshold` desde las configuraciones de la tienda.

### LoginPage / RegisterPage

**LoginPage** (`/login`): email + password con toggle de visibilidad. Al exito guarda sesion en `AuthContext` y redirige a `/admin`.

**RegisterPage** (`/register`): nombre, email, password y confirmar password con validacion local (match, minimo 6 caracteres). Al exito muestra pantalla de confirmacion "Verifica tu email" sin redirigir automaticamente.

---

## Vistas Admin

Todas las vistas admin usan `PrivateRoute` + `ShopGuard` (excepto `TiendasPage`), leen `activeShop` del `AuthContext` y comparten la misma estructura: tabla paginada de 8 filas con ordenamiento por columnas, campo de busqueda/filtro y modal de confirmacion de eliminacion.

### Dashboard — [`views/admin/Dashboard.tsx`](../frontend/src/views/admin/Dashboard.tsx)

Metricas de la tienda activa: total de productos, total de ordenes, ordenes pendientes e ingresos totales.

### Tiendas — [`views/admin/Tiendas.tsx`](../frontend/src/views/admin/Tiendas.tsx)

Lista de tiendas del usuario. Crear, seleccionar como activa (redirige a `/admin/dashboard`) y eliminar. Al entrar limpia `activeShop`.

### Productos — [`views/admin/Productos.tsx`](../frontend/src/views/admin/Productos.tsx)

CRUD completo de productos. Tabla con busqueda, filtro por categoria y por estado (`Disponible` / `Agotado` / `Inactivo`). Subida de imagen via `multipart/form-data`.

### Categorias — [`views/admin/Categorias.tsx`](../frontend/src/views/admin/Categorias.tsx)

CRUD de categorias. Al eliminar, el backend remueve la categoria de todos los productos que la referencian.

### Ordenes — [`views/admin/Ordenes.tsx`](../frontend/src/views/admin/Ordenes.tsx)

Lista de ordenes con modal de detalle (comprador, productos, envio, pago). Cambio de estado (`Pendiente` → `Confirmado` → `Enviado` → `Cancelado`) y descarga de comprobante PDF.

### Configuracion — [`views/admin/Configuracion.tsx`](../frontend/src/views/admin/Configuracion.tsx)

Edicion del perfil de la tienda: nombre, ubicacion, descripcion, categoria, logo (upload). Configuracion del checkout: `minPurchaseAmount` y `freeShippingThreshold`.

### Promociones — [`views/admin/Promociones.tsx`](../frontend/src/views/admin/Promociones.tsx)

Gestion de promociones por producto.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `porcentaje` | Descuento porcentual | 20% OFF |
| `fijo` | Descuento de monto fijo | -$500 |
| `nxm` | Llevando N unidades pagas M | 3x2 |

Tabla paginada con badges de color por tipo. Las promociones pueden activarse/desactivarse sin eliminarse.

### Usuarios — [`views/admin/Usuarios.tsx`](../frontend/src/views/admin/Usuarios.tsx)

Gestion de miembros de la tienda. Roles: `owner` y `admin`. Invitar por email, listar y revocar acceso.

---

## Servicios

### Cliente HTTP Base — [`services/api.ts`](../frontend/src/services/api.ts)

Instancia Axios con `baseURL: NEXT_PUBLIC_API_URL`. En cada request los interceptores agregan automaticamente:

1. `Authorization: Bearer <token>` — desde `localStorage`
2. `x-tenant-id: <slug>` — desde `activeShop` en `localStorage`
3. `x-api-key: <key>` — desde `NEXT_PUBLIC_INTERNAL_API_KEY`

Si la respuesta es `401` en cualquier endpoint que no sea `/auth/login` o `/auth/register`, limpia `localStorage` y redirige a `/login`.

### Variables de Entorno

| Variable | Descripcion |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL de la API (default: `http://127.0.0.1:4000/api`) |
| `NEXT_PUBLIC_INTERNAL_API_KEY` | API key interna inyectada en cada request |

### Resumen de Servicios

| Servicio | Metodos principales |
|----------|---------------------|
| [`auth.service.ts`](../frontend/src/services/auth.service.ts) | `login`, `register`, `confirmAccount`, `forgotPassword`, `resetPassword`, `acceptInvitation` |
| [`shops.service.ts`](../frontend/src/services/shops.service.ts) | `getUserShops`, `getAllShops`, `getShopBySlug`, `createShop`, `updateShop`, `deleteShop`, `uploadShopLogo`, `getMembers`, `addMember`, `removeMember` |
| [`products.service.ts`](../frontend/src/services/products.service.ts) | `getAll`, `getPublicAll`, `getById`, `create`, `update`, `delete`, `setPromotion`, `removePromotion`, `getWithPromotions` |
| [`categories.service.ts`](../frontend/src/services/categories.service.ts) | `getAll`, `getById`, `create`, `update`, `delete` |
| [`orders.service.ts`](../frontend/src/services/orders.service.ts) | `getAll`, `getById`, `createOrder`, `updateStatus`, `getShippingQuote`, `downloadPDF` |
| [`configurations.service.ts`](../frontend/src/services/configurations.service.ts) | `getAll`, `getPublic`, `upsert`, `delete` |
| [`georef.service.ts`](../frontend/src/services/georef.service.ts) | `fetchProvincias()`, `fetchLocalidades(provincia)` — API publica `apis.datos.gob.ar` |

---

## Sistema de Diseño

### Paleta de Colores

Definida como variables CSS en [`globals.css`](../frontend/src/app/globals.css) e integrada con Tailwind v4 via `@theme`.

| Rol | HEX | Uso |
|-----|-----|-----|
| Primario | `#6366F1` | Botones principales, navegacion activa, logo |
| Primario hover | `#4F46E5` | Estado hover del primario |
| Secundario | `#1E1B4B` | Sidebar, fondos oscuros, texto de alto contraste |
| Acento / Exito | `#10B981` | CTAs (crear tienda, vender), indicadores de exito |
| Fondo | `#F8FAFC` | Fondo general |
| Superficie | `#FFFFFF` | Cards, modales, inputs |
| Texto principal | `#1E293B` | Cuerpo de texto |
| Texto secundario | `#64748B` | Etiquetas, metadatos, placeholders |
| Borde | `#E2E8F0` | Divisores, bordes de inputs y cards |
| Error | `#EF4444` | Mensajes de error |
| Warning | `#F59E0B` | Alertas |

### Tipografia

**Fuente:** Inter (Google Fonts, pesos 400/500/600/700). Fallback: `system-ui, -apple-system, sans-serif`.

| Elemento | Tamano | Peso | Uso |
|----------|--------|------|-----|
| H1 | 30px / 1.875rem | 700 | Titulos de pagina |
| H2 | 24px / 1.5rem | 600 | Subtitulos de seccion |
| H3 | 20px / 1.25rem | 500 | Titulos de cards |
| Body | 16px / 1rem | 400 | Texto general |
| Small | 14px / 0.875rem | 400 | Etiquetas, metadatos |

Nunca usar negro puro `#000000`. Principal en `#1E293B`, secundario en `#64748B`.

### Radios y Sombras

| Contexto | Tailwind | Valor |
|----------|---------|-------|
| Botones e inputs | `rounded-md` | 6px |
| Cards y modales | `rounded-lg` | 8px |
| Elementos grandes | `rounded-xl` | 12px |

| Nivel | Tailwind | Uso |
|-------|---------|-----|
| 1 | `shadow-sm` | Cards, dropdowns |
| 2 | `shadow-md` | Modales, hover |

### Iconografia

- **Libreria:** Lucide React — stroke, grosor 2px
- **Tamano:** 20px en botones, 24px en navegacion

### Accesibilidad

- Botones de solo icono deben tener `aria-label` o `title`
- Todas las imagenes deben tener atributo `alt`
- El contraste de la paleta cumple WCAG AA
