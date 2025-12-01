

# Documentación de la API

## Indice
- [Endpoints Auth `/api/auth`](#endpoints-auth-apiauth)
- [Endpoints Tiendas `/api/shops`](#endpoints-tiendas-apishops)
- [Endpoints Productos `/api/products`](#endpoints-productos-apiproducts)
- [Endpoints Categorías `/api/categories`](#endpoints-categorías-apicategories)
- [Endpoints Órdenes `/api/orders`](#endpoints-órdenes-apiorders)

### Importar [Postman Collection](TrabajoFinal.postman_collection.json)
- Crear un Entorno en Postman con la variable `host` y asignarle el valor `http://127.0.0.1:4000`
### Path recomendado para probar Endpoints

- Primero registrar y loguear un usuario en el endpoint `/api/auth` para obtener un token JWT.
- Despues crear una tienda en el endpoint `/api/shops` usando el token JWT.
- Usar el id de la tienda creada como `x-tenant-id` en los demas endpoints.
- Crear categorias y productos en la tienda.
- Finalmente crear ordenes de compra con los productos creados.

## Endpoints Auth `/api/auth`

| Método     | URL                  | Descripción          | Detalles                              |
| ---------- | -------------------- | -------------------- | ------------------------------------- |
| <span style="color: green;">**POST**</span>    | `/api/auth/register` | Registra un usuario  | [Ver detalles](#post-apiauthregister) |
| <span style="color: green;">**POST**</span>    | `/api/auth/login`    | Inicia sesión        | [Ver detalles](#post-apiauthlogin)    |
| <span style="color: blue;">**GET**</span>      | `/api/auth/users`    | Obtiene usuarios     | [Ver detalles](#get-apiauthusers)     |

---

### <span style="color: green;">POST</span> `/api/auth/register`

- Registra un nuevo usuario en la plataforma.

#### Headers
```
Content-Type: application/json
```

#### Body (JSON)

| Campo        | Tipo     | Descripción                     |
|--------------|----------|----------------------------------|
| name         | string   | Nombre completo del usuario     |
| email        | string   | Email del usuario               |
| password     | string   | Contraseña del usuario          |

**Ejemplo:**
```json
{
  "name": "pepe",
  "email": "pepe@gmail.com",
  "password": "123456"
}
```

#### Response

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "...",
    "name": "pepe",
    "email": "pepe@gmail.com",
    "associatedStores": [],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### <span style="color: green;">POST</span> `/api/auth/login`

- Inicia sesión con un usuario existente.
- Con el token JWT devuelto, se pueden autenticar las solicitudes a los endpoints protegidos.

#### Headers
```
Content-Type: application/json
```

#### Body (JSON)

| Campo        | Tipo     | Descripción                     |
|--------------|----------|----------------------------------|
| email        | string   | Email del usuario               |
| password     | string   | Contraseña del usuario          |

**Ejemplo:**
```json
{
  "email": "pepe@gmail.com",
  "password": "123456"
}
```

#### Response

```json
{
  "message": "Login exitoso",
  "user": {
    "_id": "692ca0803c9f5fa302363648",
    "name": "pepe",
    "email": "pepe@gmail.com",
    "associatedStores": [
      {
        "tenantId": "692ca08a3c9f5fa30236364e",
        "slug": "test",
        "storeName": "test",
        "role": "owner",
        "_id": "692ca08a3c9f5fa302363650"
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### <span style="color: blue;">GET</span> `/api/auth/users`

- Obtiene la lista de todos los usuarios registrados.

#### Headers
```
(No requiere headers especiales)
```

#### Response

```json
[
  {
    "_id": "692ca0803c9f5fa302363648",
    "name": "pepe",
    "email": "pepe@gmail.com",
    "associatedStores": [...],
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

---

## Endpoints Tiendas `/api/shops`

| Método     | URL                      | Descripción                    | Detalles                                  |
| ---------- | ------------------------ | ------------------------------ | ----------------------------------------- |
| <span style="color: blue;">**GET**</span>      | `/api/shops`             | Obtiene todas las tiendas      | [Ver detalles](#get-apishops)             |
| <span style="color: blue;">**GET**</span>      | `/api/shops/{slug}`      | Obtiene una tienda por slug    | [Ver detalles](#get-apishopsslug)         |
| <span style="color: blue;">**GET**</span>      | `/api/shops/user/{userId}` | Obtiene tiendas de un usuario | [Ver detalles](#get-apishopsuseruserid)   |
| <span style="color: green;">**POST**</span>    | `/api/shops`             | Crea una nueva tienda          | [Ver detalles](#post-apishops)            |
| <span style="color: red;">**DELETE**</span>    | `/api/shops/{slug}`      | Elimina una tienda             | [Ver detalles](#delete-apishopsslug)      |

---

### <span style="color: blue;">GET</span> `/api/shops`

- Obtiene la lista de todas las tiendas registradas.

#### Headers
```
(No requiere headers especiales)
```

---

### <span style="color: blue;">GET</span> `/api/shops/{slug}`

- Obtiene los detalles de una tienda específica por su slug.

#### Headers
```
(No requiere headers especiales)
```

#### Params
- slug: Identificador único de la tienda (ej: "test", "mi-tienda")

---

### <span style="color: blue;">GET</span> `/api/shops/user/{userId}`

- Obtiene todas las tiendas asociadas a un usuario específico.

#### Headers
```
Authorization: Bearer <token>
```

#### Params
- userId: ID del usuario

---

### <span style="color: green;">POST</span> `/api/shops`

- Crea una nueva tienda y la asocia al usuario.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (JSON)

| Campo        | Tipo     | Descripción                        |
|--------------|----------|------------------------------------|
| userId       | string   | ID del usuario propietario         |
| slug         | string   | Identificador único de la tienda   |
| storeName    | string   | Nombre de la tienda                |
| location     | string   | Ubicación de la tienda             |
| description  | string   | Descripción de la tienda           |

**Ejemplo:**
```json
{   
  "userId": "692c89f67e4ea0c3f344d5a4",
  "slug": "test123123", 
  "storeName": "test123123",
  "location": "Calle 123",
  "description": "123"
}
```

---

### <span style="color: red;">DELETE</span> `/api/shops/{slug}`

- Elimina una tienda existente.

#### Headers
```
Authorization: Bearer <token>
```

#### Params
- slug: Identificador único de la tienda a eliminar

---

## Endpoints Categorías `/api/categories`

| Método     | URL                      | Descripción                    | Detalles                                  |
| ---------- | ------------------------ | ------------------------------ | ----------------------------------------- |
| <span style="color: blue;">**GET**</span>      | `/api/categories`        | Obtiene categorías             | [Ver detalles](#get-apicategories)        |
| <span style="color: green;">**POST**</span>    | `/api/categories`        | Crea una categoría             | [Ver detalles](#post-apicategories)       |
| <span style="color: red;">**DELETE**</span>    | `/api/categories/{id}`   | Elimina una categoría          | [Ver detalles](#delete-apicategoriesid)   |

---

### <span style="color: blue;">GET</span> `/api/categories`

- Obtiene la lista de categorías de la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
```

---

### <span style="color: green;">POST</span> `/api/categories`

- Crea una nueva categoría en la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (JSON)

| Campo        | Tipo     | Descripción                     |
|--------------|----------|----------------------------------|
| name         | string   | Nombre de la categoría          |

**Ejemplo:**
```json
{
  "name": "Bebida"
}
```

---

### <span style="color: red;">DELETE</span> `/api/categories/{id}`

- Elimina una categoría existente en la tienda.
- También elimina la categoría de todos los productos que la contengan.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
```

#### Params
- id: ID de la categoría a eliminar

---

## Endpoints Órdenes `/api/orders`

| Método     | URL                  | Descripción                    | Detalles                              |
| ---------- | -------------------- | ------------------------------ | ------------------------------------- |
| <span style="color: blue;">**GET**</span>      | `/api/orders`        | Obtiene todas las órdenes      | [Ver detalles](#get-apiorders)        |
| <span style="color: blue;">**GET**</span>      | `/api/orders/{id}`   | Obtiene una orden específica   | [Ver detalles](#get-apiordersid)      |
| <span style="color: green;">**POST**</span>    | `/api/orders`        | Crea una nueva orden           | [Ver detalles](#post-apiorders)       |
| <span style="color: yellow;">**PUT**</span>    | `/api/orders/{id}`   | Actualiza estado de orden      | [Ver detalles](#put-apiordersid)      |

---

### <span style="color: blue;">GET</span> `/api/orders`

- Obtiene la lista de todas las órdenes de la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
```

---

### <span style="color: blue;">GET</span> `/api/orders/{id}`

- Obtiene los detalles de una orden específica.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
```

#### Params
- id: ID de la orden

---

### <span style="color: green;">POST</span> `/api/orders`

- Crea una nueva orden de compra.
- Calcula automáticamente el total basándose en los productos y cantidades.
- Reduce el stock de los productos automáticamente.

#### Headers
```
x-tenant-id: <tenant_id>
Content-Type: application/json
```

#### Body (JSON)

| Campo        | Tipo     | Descripción                        |
|--------------|----------|------------------------------------|
| buyer        | object   | Información del comprador          |
| buyer.name   | string   | Nombre del comprador               |
| buyer.email  | string   | Email del comprador                |
| buyer.address| string   | Dirección del comprador            |
| buyer.postalCode | string | Código postal                    |
| products     | array    | Lista de productos a comprar       |
| products[].productId | string | ID del producto           |
| products[].quantity  | number | Cantidad a comprar        |

**Ejemplo:**
```json
{
  "buyer": {
    "name": "Pepe",          
    "email": "Pepeargento@gmail.com",   
    "address": "Calle 123", 
    "postalCode": "1234"           
  },
  "products": [
    {
      "productId": "692c90944abcb017e3c15549", 
      "quantity": 10                       
    }
  ]
}
```

---

### <span style="color: yellow;">PUT</span> `/api/orders/{id}`

- Actualiza el estado de una orden existente.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
Content-Type: application/json
```

#### Params
- id: ID de la orden a actualizar

#### Body (JSON)

| Campo        | Tipo     | Descripción                     | Valores permitidos                    |
|--------------|----------|---------------------------------|---------------------------------------|
| status       | string   | Nuevo estado de la orden        | "Pendiente", "Pagado", "Enviado", "Cancelado" |

**Ejemplo:**
```json
{
  "status": "Cancelado"
}
```

---

## Endpoints Productos `/api/products`

| Método     | URL                  | Descripción          | Detalles                              |
| ---------- | -------------------- | -------------------- | ------------------------------------- |
| <span style="color: blue;">**GET**</span>      | `/api/products`      | Obtiene productos    | [Ver detalles](#get-apiproducts)      |
| <span style="color: blue;">**GET**</span>      | `/api/products/{id}` | Obtiene un producto  | [Ver detalles](#get-apiproductsid)    |
| <span style="color: green;">**POST**</span>    | `/api/products`      | Crea un producto     | [Ver detalles](#post-apiproducts)     |
| <span style="color: yellow;">**PUT**</span>    | `/api/products/{id}` | Actualiza un producto| [Ver detalles](#put-apiproductsid)    |
| <span style="color: red;">**DELETE**</span>    | `/api/products/{id}` | Elimina un producto  | [Ver detalles](#delete-apiproductsid) |

---

### <span style="color: blue;">GET</span> `/api/products`

- Obtiene la lista de productos en la tienda.

#### Headers
```
x-tenant-id: <tenant_id> 
```

---

### <span style="color: blue;">GET</span> `/api/products/{id}`

- Obtiene los detalles de un producto específico.

#### Headers
```
x-tenant-id: <tenant_id>
```

#### Params
- id: ID del producto

---

### <span style="color: green;">POST</span> `/api/products`

- Crea un nuevo producto en la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Body (form-data)

| Campo        | Tipo     | Descripción                     |
|--------------|----------|----------------------------------|
| name         | text     | Nombre del producto             |
| description  | text     | Descripción del producto        |
| price        | number   | Precio del producto             |
| stock        | number   | Cantidad en stock               |
| image        | file     | Archivo de imagen del producto  |
| categories   | text     | Array de IDs de categorías (JSON string) |

**Ejemplo:**
```
name: "Pelota Cilindrica"
description: "pelota cuadrada wtf"
price: 100
stock: 100
image: [archivo]
categories: []
```

---

### <span style="color: yellow;">PUT</span> `/api/products/{id}`

- Actualiza un producto existente en la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Params
- id: ID del producto a actualizar

#### Body (form-data)

(Todos los campos son opcionales, solo enviar los que se quieran actualizar)

| Campo        | Tipo     | Descripción                     |
|--------------|----------|----------------------------------|
| name         | text     | Nombre del producto             |
| description  | text     | Descripción del producto        |
| price        | number   | Precio del producto             |
| stock        | number   | Cantidad en stock               |
| image        | file     | Archivo de imagen del producto  |
| categories   | text     | Array de IDs de categorías      |

---

### <span style="color: red;">DELETE</span> `/api/products/{id}`

- Elimina un producto existente en la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
Authorization: Bearer <token>
```

#### Params
- id: ID del producto a eliminar

---