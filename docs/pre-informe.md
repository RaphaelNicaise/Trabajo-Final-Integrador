# Proyecto: Plataforma de tiendas (estilo “tienda-nube / Shopify”)

## 1. Resumen del producto

Una plataforma SaaS que permite a vendedores crear y administrar una tienda dentro de nuestra web. Cada vendedor tendrá:

* Un panel privado para gestionar productos, stock y pedidos.
* Una tienda pública bajo nuestra URL, p. ej. `nuestraPagina.com/shop/tiendacliente123`.
* Gestión básica de ventas (pedidos, estados, historial).
* Subida de imágenes (S3) y dashboard sencillo de métricas.

Objetivo MVP: permitir crear una tienda, subir productos, ordenar productos con drag & drop simple (A DEFINIR) y procesar pagos con una pasarela (Stripe / MercadoPago) — todo desplegable en AWS y con CI (tests) + CD (deploy por push a `main`).

Tecnologías principales: **Express, Node, TypeScript, React (Vite), Tailwind, Docker, GitHub Actions, MongoDB (cluster), AWS**. (Sequelize está en la lista original para cuando se decida usar SQL; para el MVP con Mongo usaremos Mongoose).

---

## 2. Alcance del MVP

Funciones mínimas (obligatorias para MVP):

1. Registro / login para vendedores (auth JWT).
2. Crear tienda (metadata mínima: name, slug, owner).
3. CRUD de productos (nombre, descripción, precio, stock, imagen).
4. Drag & drop simple para ordenar productos en la página pública. (A DEFINIR)
5. Storefront público renderizado según configuración (JSON).
6. Checkout funcional (sandbox Stripe/MercadoPago).
7. Panel de pedidos (ver, cambiar estado).
8. Upload de imágenes a S3.
9. Despliegue automático a AWS (desde `main`) vía GitHub Actions que hace SSH y `docker-compose up -d --build`.

Funciones fuera del MVP (v2):

* Editor avanzado tipo Webflow (bloques, estilos).
* Marketplace, afiliados, multi-moneda, multi-idioma.
* DB dedicada por defecto para todos (solo para planes enterprise).

---

## 3. Decisión clave: Base de datos por tienda en el mismo cluster Mongo

**Idea:**  
Cada tienda tiene su propia base de datos dentro del mismo cluster Mongo (ejemplo: `shop_<slug>`). Además, existe una base central de metadatos (`platform_meta`) con la colección `stores`, que contiene la información y configuración de cada tienda.

### Ventajas

- **Aislamiento lógico:** Permite backups, restores y retenciones por tienda.
- **Escalabilidad:** Fácil de ofrecer “DB dedicada” como feature premium migrando tiendas a clusters separados en el futuro.
- **Equilibrio costo/aislamiento:** Un solo cluster con muchas bases de datos.

### Desventajas / Complejidad

- El backend debe gestionar conexiones dinámicas (pool por DB).
- Migraciones y cambios de esquema deben aplicarse a todas las bases de datos.
- Lecturas/operaciones globales (reportes, agregados) requieren consultar varias bases o mantener agregados en la base central.

### Recomendación práctica para el MVP

- Usar un único cluster (Mongo Atlas o Mongo replicado en AWS) y crear una base de datos por tienda (`shop_<storeId>`).
- Mantener una base `platform_meta` para usuarios, tiendas y referencias a cada base.
- Implementar un pool de conexiones sencillo con caché de conexiones activas y cierre LRU para evitar exceso de conexiones simultáneas.

### Naming / Convención

- **DB por tienda:** `shop_{storeSlug}` o `shop_{storeId}`
- **Colecciones por tienda:** `products`, `orders`, `settings`, etc.
- **Meta DB:** `platform_meta` con colección `stores`:

```json
{
    "_id": "603f...",
    "slug": "tiendacliente123",
    "ownerUserId": "u_123",
    "dbName": "shop_tiendacliente123",
    "createdAt": "2025-09-19T...",
    "plan": "free"
}
```

### Backups

- **Mongo Atlas:** Activar backups automáticos por cluster (permite recovery por DB).
- **Mongo en EC2/EBS:** Crear snapshots regulares y scripts de `mongodump` por base de datos.

---

## 4. Arquitectura técnica (alto nivel)

* **Frontend**: React + Vite + TypeScript + Tailwind. Build servido por nginx en producción. Editor drag & drop con dnd-kit o similar. (que no sabemos si lo implementaremos)
* **Backend**: Node + Express + TypeScript. Mongoose para Mongo. Autenticación JWT. Endpoints REST
* **Almacenamiento de archivos**:  
  - **Desarrollo**: MinIO (contenedor local simula S3).  
  - **Producción**: AWS S3.  
  - Opcional: CloudFront como CDN.
* **DB**: MongoDB cluster (Atlas o self-managed en EC2). Multi-DB (una DB por tienda).
* **Infra / Contenedores**: Docker Compose local / Docker images para prod. En AWS: EC2 con docker-compose.
* **CI/CD**: GitHub Actions → en push a `main` hace tests y luego SSH al servidor y ejecuta `docker-compose up -d --build`.

### Dominio y HTTPS
Para un proyecto real, se usarían servicios como:
- **Route53**: para gestionar el dominio.
- **AWS Certificate Manager (ACM)**: para certificados TLS/HTTPS.
- **CloudFront + Nginx**: para servir el frontend de forma segura y enrutar el tráfico al backend.

> Para nuestro proyecto universitario, esto no es obligatorio. Basta con usar la IP pública de la instancia EC2 y HTTP, evitando complejidad extra.

### Gestión de secretos
- **GitHub Secrets**: para almacenar credenciales necesarias en CI/CD.
- **AWS Secrets Manager** o **.env en el servidor**: para almacenar claves sensibles (como URIs de Mongo o tokens de pago).

> Para el prototipo, podemos simplificar usando variables de entorno en el servidor directamente.

### Arquitectura visual (simplificada)
[Usuario]
-> Frontend (React SPA, servido por nginx o directamente por Vite)
-> Backend (Express + Docker)
-> Mongo Cluster (una base de datos por tienda: shop_a, shop_b, ...)
-> S3 (opcional, para imágenes de productos)

markdown
Copiar código

**Notas:**
- Lo vital para el prototipo: Frontend + Backend + Mongo (multi-DB) + almacenamiento de imágenes (S3 o local).  
- Componentes opcionales para producción real: Nginx, CloudFront, dominio con HTTPS, Secrets Manager.
 
---

## 5. Gestión de conexiones Mongo (ejemplo de estrategia)

- Central: `platform_meta.stores` con `dbName`.
- Middleware: al recibir request con `storeSlug`, buscar `dbName` y obtener/crear conexión Mongoose para esa DB.
- Cache: mantener un map `connections[dbName] = mongooseConnection` reusado; cerrar conexiones inactivas después de x tiempo si el número excede un límite.

**Ejemplo pseudocódigo:**

```typescript
const connCache = new Map<string, Connection>();

async function getTenantConnection(dbName: string) {
    if (connCache.has(dbName)) return connCache.get(dbName);
    const uri = process.env.MONGO_BASE_URI + '/' + dbName;
    const conn = await mongoose.createConnection(uri, options).asPromise();
    connCache.set(dbName, conn);
    // opcional: implement LRU cleanup
    return conn;
}
```

---

## 6. Deploy en AWS (opciones y recomendaciones)

**Recomendación MVP**: EC2 con Docker & docker-compose (más simple, económico para un PoC), o ECS Fargate si querés serverless containers.

Componentes sugeridos:

* **EC2 instance** (t2.micro / t3.small según carga) con Docker + docker-compose, o
* **MongoDB**:

  * **Opción Atlas (recomendada)**: Mongo Atlas en AWS — administración + backups automáticos + monitoreo; permite múltiples DBs por cluster y es fácil de escalar.
  * **Opción self-hosted**: desplegar replica set en EC2 + EBS, pero requiere más ops.
* **S3**: hosting de imágenes.  
  → **Nota**: en desarrollo se usa MinIO en contenedor, en producción AWS S3.  
* **CloudFront + ACM**: distribución de contenido + certificados TLS (HTTPS).  
* **Route53**: DNS.  
* **IAM**: solo lo justo y necesario (secrets para S3, Stripe, MercadoPago). Como es un proyecto universitario no se aplicará IAM avanzado ni ECR.  

**Steps deploy (EC2 + docker-compose)**:

- EC2 con Docker + docker-compose.

- Clonar repo en ~/ecommerce-app.

- .env con variables (no en repo).

- docker-compose pull (no hay imágenes privadas) y docker-compose up -d --build.

- GitHub Actions SSH → git pull → docker-compose up -d --build.

---

## 7. CI/CD (GitHub Actions) — flujo recomendado

- `test.yml` (Pull Request / push): ejecuta tests backend y frontend (unit + linters).
- `deploy.yml` (push a main):
    - actions/checkout
    - SSH hacia EC2 (`appleboy/ssh-action`) y ejecutar:
        ```bash
        cd ~/ecommerce-app
        git pull origin main
        docker-compose down
        docker-compose up -d --build
        ```

**Secrets:**

- `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`
- `AWS_*` si necesitás operaciones con AWS
- `STRIPE_SECRET`, `MERCADOPAGO_TOKEN`, etc.

---

## 8. Estructura de proyecto (recordatorio)

```
/proyecto-ecommerce
    /backend
        src/
            controllers/ models/ routes/ services/
            index.ts
        package.json
        pnpm-lock.yaml
        tsconfig.json
        Dockerfile (dev & prod variants)
    /frontend
        src/
        package.json
        pnpm-lock.yaml
        vite.config.ts
        tailwind.config.js
        Dockerfile
    docker-compose.yml
    .github/workflows/test.yml
    .github/workflows/deploy.yml
    README.md
```

---

## 9. Roles y tareas del equipo (5 personas — ejemplo)

- **DevOps / Infra (1):** AWS setup (EC2), Mongo Atlas config, S3, CI/CD secrets, deploy scripts.
- **Backend (2):** Auth, multi-DB tenant layer, products/orders API, payments integration.
- **Frontend (1):** Vite + React store UI, admin dashboard, drag & drop editor.
- **Fullstack / QA (1):** Integración frontend-backend, tests, e2e, documentación y preparación del demo.

---

## 10. Timeline estimado (3 meses — objetivo original)

Con 4 devs 8–10hs/semana (36 hs/sem total) y prioridad en MVP:

- **Sem 1–2:** Infra + repos + auth + estructura backend + Docker basic.
- **Sem 3–4:** CRUD productos + images S3 + admin básico.
- **Sem 5–6:** Storefront público + render JSON + simple drag & drop.
- **Sem 7–8:** Checkout/Payments + orders + dashboard de ventas.
- **Sem 9–10:** Tests, CI, GitHub Actions, preparar deploy en AWS.
- **Sem 11–12:** Polish, documentación, demo y arreglos.

*(Estos plazos dependen de la complejidad del editor drag & drop (que no sabemos si lo implementaremos): limitar el editor a “ordenar productos” reduce mucho tiempo.)*

---

## 11. Riesgos y mitigaciones

- **Riesgo:** Drag & drop muy ambicioso.  
    **Mitigación:** Limitar bloques a producto / grid simple.
- **Riesgo:** Manejo de muchas DBs y conexiones.  
    **Mitigación:** Implementar pool con TTL y usar Atlas para simplificar backups.
- **Riesgo:** Pagos y seguridad.  
    **Mitigación:** Usar Stripe/MercadoPago sandbox y HTTPS; no almacenar datos sensibles de tarjetas.
- **Riesgo:** CI que hace deploy roto.  
    **Mitigación:** Test obligatorio en PR antes de merge a main.

---

## 12. Próximos pasos concretos (acción inmediata)

- Definir nombre provisional y hostname para demo (`nuestraPagina.com` o subdominio).
- Preparar platform_meta schema y endpoint para crear tiendas (dev backend).
- Implementar connection manager en backend (Mongoose dynamic DB).
- Construir frontend minimal: listing de tienda, admin product CRUD.
- Configurar Mongo Atlas (o decidir self-hosted) y crear cluster de pruebas.
- Preparar `docker-compose.prod.yml` y script de deploy en servidor EC2.
- Crear workflows `test.yml` (PR) y `deploy.yml` (main) con SSH deploy.

---

## 13. Fragmentos útiles (para incluir en informe)

**Store meta example (`platform_meta.stores`):**

```json
{
    "_id": "s_001",
    "slug": "tiendacliente123",
    "ownerUserId": "u_123",
    "dbName": "shop_tiendacliente123",
    "plan": "free",
    "createdAt": "2025-09-19T..."
}
```

**Snippet connection manager (TypeScript / Mongoose):**

```typescript
import mongoose from 'mongoose';
const connCache = new Map<string, mongoose.Connection>();

export async function getTenantConnection(dbName: string) {
    if (connCache.has(dbName)) return connCache.get(dbName)!;
    const uri = `${process.env.MONGO_BASE_URI}/${dbName}`;
    const conn = await mongoose.createConnection(uri, { /* options */ }).asPromise();
    connCache.set(dbName, conn);
    return conn;
}
```

---

¿Necesitás el README.md listo para el repo o un documento formal para presentar?