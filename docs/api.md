

# Documentación de la API


## Endpoints Productos `/api/products`

| Método     | URL                  | Descripción          | Detalles                              |
| ---------- | -------------------- | -------------------- | ------------------------------------- |
| <span style="color: blue;">**GET**</span>   | `/api/products`      | Obtiene productos    | [Ver detalles](#get-apiproducts)      |
| <span style="color: green;">**POST**</span>    | `/api/products`      | Crea un Producto      | [Ver detalles](#post-apiproducts)     |
| <span style="color: yellow;">**PUT**</span>    | `/api/products/{id}` | Actualiza un Producto | [Ver detalles](#put-apiproducts)    |
| <span style="color: red;">**DELETE**</span>  | `/api/products/{id}` | Elimina un Producto   | [Ver detalles](#delete-apiproducts) |

---

## <span style="color: blue;">GET</span> `/api/products`

- Obtiene la lista de productos en la tienda.

####  Headers
```
x-tenant-id: <tenant_id> 
```



## <span style="color: green;">POST</span> `/api/products`

- Crea un nuevo producto en la tienda.

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

## <span style="color: yellow;">PUT</span> `/api/products/{id}`

- Actualiza un producto existente en la tienda.

#### Headers
```
x-tenant-id: <tenant_id>
```

#### Params
- id: ID del producto a actualizar

#### Body (form-data)

- (Todos los campos son opcionales, solo envíar el que se quiera actualizar)

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

## <span style="color: red;">Delete</span> `/api/products/{id}`

- Elimina un producto existente en la tienda.
#### Headers
```
x-tenant-id: <tenant_id>
```
#### Params
- id: ID del producto a eliminar

---