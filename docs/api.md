

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

## <span style="color: green;">POST</span> `/api/products`

Crea un nuevo producto en la tienda.

#### Headers
```
x-tenant-id: <tenant_id> 
```

#### Body

```json
{
  "name": "Producto1",
  "description": "Descripcion de Producto",
  "price": 3000,
  "stock": 1000,
  "imageUrl": ""
}
```




---

