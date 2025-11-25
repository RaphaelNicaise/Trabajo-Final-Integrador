

# Documentación de la API


## Endpoints Productos `/api/products`

| Método     | URL                  | Descripción          | Detalles                              |
| ---------- | -------------------- | -------------------- | ------------------------------------- |
| <span style="color: blue;">**GET**</span>   | `/api/products`      | Obtiene recursos     | [Ver detalles](#get-apiproducts)      |
| <span style="color: green;">**POST**</span>    | `/api/products`      | Crea un recurso      | [Ver detalles](#post-apiproducts)     |
| **PUT**    | `/ruta/ejemplo/{id}` | Actualiza un recurso | [Ver detalles](#put-rutaejemploid)    |
| **DELETE** | `/ruta/ejemplo/{id}` | Elimina un recurso   | [Ver detalles](#delete-rutaejemploid) |

---

## <span style="color: blue;">GET</span> `/api/products`

Obtiene la lista de productos en la tienda.

####  Headers
```
x-tenant-id: <tenant_id> 
```

Aquí tenés el bloque actualizado en `.md`, usando **form-data** y reemplazando `imageUrl` por `image` (tipo archivo):


## <span style="color: green;">POST</span> `/api/products`

Crea un nuevo producto en la tienda.

#### Headers
```

x-tenant-id: <tenant_id>

```

#### Body (form-data)

| Campo        | Tipo     | Descripción                     |
|--------------|----------|----------------------------------|
| name         | text     | Nombre del producto             |
| description  | text     | Descripción del producto        |
| price        | number   | Precio del producto             |
| stock        | number   | Cantidad en stock               |
| image        | file     | Archivo de imagen del producto  |


```
Content-Type: multipart/form-data
```

