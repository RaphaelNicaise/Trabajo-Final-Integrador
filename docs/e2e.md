# Documentación de Tests End-to-End (E2E)

En este documento detallamos el flujo de pruebas E2E (End-to-End) implementado en el proyecto, las herramientas utilizadas y cómo ejecutar las pruebas. Estas pruebas se aseguran de que todos los componentes clave del sistema funcionen correctamente integrados desde la perspectiva del usuario.

## Herramientas Utilizadas

- **Playwright (`@playwright/test`)**: Framework moderno para testing E2E en aplicaciones web. Automático, rápido y con control total sobre múltiples navegadores (Chromium, Firefox, WebKit).
- **Dotenv (`dotenv`)**: Para la carga de variables de entorno, permitiendo inyectar dinámicamente URLs como `PLAYWRIGHT_BASE_URL` dependiendo del ambiente (local o Docker).
- **TypeScript**: Para tipeo estático en la definición de nuestros escenarios de prueba.

## Estructura y Configuración

El proyecto E2E se ubica en la carpeta `/e2e` en la raíz del repositorio.

- **`playwright.config.ts`**: Archivo de configuración central de Playwright. Configura el uso del navegador (Chromium por defecto), habilitación del generador de reportes en formato HTML, gestión paralela de pruebas completas, y opciones para CI. Utiliza `http://localhost:3000` si la variable `PLAYWRIGHT_BASE_URL` no está definida.
- **`package.json`**: Contiene las dependencias del módulo E2E y scripts de atajo para ejecutar pruebas (`npm run test` y `npm run test:ui`).
- **`/tests/`**: Directorio donde residen los flujos de pruebas automatizados.

## Flujos Implementados

Se han implementado cuatro suites principales para cubrir el comportamiento esperado de un usuario en el frontend:

### 1. Navegación, Búsqueda y Login (`navegacion-busqueda-login.test.ts`)
Valida la interacción general del usuario anónimo a través de la aplicación:
- **Búsqueda**: Permite usar el input de búsqueda interactivo iterando sobre listados de tiendas ("Tienda Test").
- **Filtros por Categoría**: Asegura que el selector de categorías filtre exitosamente tiendas en el dashboard.
- **Navegación general al Login**: Confirma que el botón de inicio de sesión desvía al usuario correctamente a la ruta de `/login`, con presencia garantizada de campos de e-mail, contraseña y botón con su acción ('Iniciar Sesión').

### 2. Flujo Básico / Pantalla Principal (`pagina-principal.test.ts`)
Asegura la carga de la identidad del portal "StoreHub" para una navegación natural:
- Valida que el logotipo de StoreHub esté presente luego del cargado en `/`.
- Explora una tienda en particular.
- Agrega productos al carrito varias veces para confirmar que el contador global flotante del carrito ubicado en la esquina se actualice progresivamente (1 a 2 ítems).

### 3. Flujo Completo de Visualización (`flujo-completo.test.ts`)
Valida específicamente la estructura e integración de la visualización de tiendas en profundidad:
- Comprueba el click-through-rate en tiendas disponibles.
- Verifica que el título visible principal (`heading`) coincida con los datos reales de la tienda solicitada.

### 4. Flujo de Checkout Básico / Completo (`compra.test.ts`)
Comprobación integral paso a paso del cierre de una venta y recopilación de datos de usuario. Es el _Happy Path_ de una compra de inicio a fin:
- Acceso al Store, ingreso a una tienda y suma de artículos mediante los botones dinámicos "Agregar".
- Navegación interna usando el botón de resumen de Carrito.
- Click en "Proceder al Checkout", que lleva a confirmar datos en múltiples etapas:
  - **Identificación**: Nombre completo, número de contacto, E-mail.
  - **Despacho / Envío**: Despliegues automáticos Selectivos (Provincia y Ciudad), dirección de puerta y código postal.
  - **Pago Simulado**: Carga de tarjeta de crédito estandarizada de testing, fecha de caducidad y código de verificación.
- Finaliza el pedido mediante el botón "Confirmar y Pagar", interceptando la pantalla definitiva de éxito con el estado final `¡Orden Confirmada!`.

## Ejecución de Pruebas

Para correr el flujo del test dentro del contexto del servicio `/e2e`, posicionate en la carpeta del servicio:

```bash
cd e2e
```

| Comando | Descripción de Acción |
| --- | --- |
| `npm run test` | Ejecuta las pruebas Playwright en modo "headless" (sin abrir ventana). Al finalizar brinda links opcionales (por terminal) a un reporte de trazas HTML detallado en caso de fallos. |
| `npm run test:ui` | Abre la UI interactiva e inmersiva de Playwright (Watch Modus) pudiendo ver visualmente trazas, tiempo de ejecución, DOM elements al clickear y ver exactamente lo que está haciendo el flujo automático del bot. Ideal para desarrollar / depurar nuevos tests. |

## Reportes de Resultados

Después de ejecutar los comandos en modo headless, Playwright generará si es requerido (o por defecto en base al archivo de config) una carpeta `/playwright-report` con un `index.html`. Podrás acceder mediante comando a explorarlo con vista interactiva:

```bash
npx playwright show-report
```
