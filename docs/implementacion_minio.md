Es una **excelente decisión**. Utilizar MinIO en local para simular S3 es el estándar de la industria y la arquitectura que propones (carpetas por tenant) es la correcta para mantener el aislamiento de datos.

**Corrección técnica importante:**
Mencionaste `boto3`. **Boto3 es la librería de AWS para Python**. Como tu backend está en **Node.js/TypeScript**, debes usar el **AWS SDK for JavaScript v3** (`@aws-sdk/client-s3`). La lógica es idéntica, solo cambia la sintaxis del lenguaje.

Aquí tienes la implementación completa de la infraestructura de almacenamiento.

### 1. Configuración de MinIO en Docker
Agrega esto a tu `docker-compose.yml` para levantar el servicio localmente.


```yaml
  minio:
    image: minio/minio
    container_name: minio_s3
    ports:
      - "9000:9000" # API S3
      - "9001:9001" # Consola Web
    environment:
      MINIO_ROOT_USER: "minioadmin"
      MINIO_ROOT_PASSWORD: "minioadmin"
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - app_network

    ...

    volumes:
      mongo_data:
      minio_data:
```

### 2. Módulo de Almacenamiento (Backend)

Vamos a crear un servicio dedicado a manejar S3. Esto abstrae si estás usando MinIO o AWS real.

Primero, instala las dependencias necesarias:
`npm install @aws-sdk/client-s3 multer`
`npm install --save-dev @types/multer`

#### A. Configuración del Cliente S3

```ts
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  },
  // Configuración específica para MinIO vs AWS S3
  endpoint: isProduction ? undefined : 'http://localhost:9000', // En docker backend usar 'http://minio:9000'
  forcePathStyle: !isProduction, // Necesario para MinIO (usa path-style vs domain-style)
});

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'storehub-products';
```


#### B. Servicio de Subida (`StorageService`)

Este servicio implementa tu lógica: **`shopId/products/imagen.jpg`**.
```ts
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '../../../config/s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class StorageService {

  /**
   * Sube un archivo al bucket organizándolo por tienda.
   * Estructura: {shopId}/products/{uuid}.ext
   */
  async uploadProductImage(shopId: string, file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Aquí definimos la "carpeta" virtual
    const key = `${shopId}/products/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // Descomentar si el bucket no tiene política pública por defecto
    });

    try {
      await s3Client.send(command);
      
      // Construimos la URL pública
      // Nota: En producción esto será la URL de AWS S3 o CloudFront
      if (process.env.NODE_ENV === 'production') {
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
      } else {
        // URL Local de MinIO
        return `http://localhost:9000/${BUCKET_NAME}/${key}`;
      }
    } catch (error) {
      console.error('Error subiendo imagen a S3/MinIO:', error);
      throw new Error('No se pudo subir la imagen');
    }
  }

  /**
   * Elimina una imagen (útil si borran el producto)
   */
  async deleteFile(fileUrl: string) {
    try {
      // Extraer la Key de la URL completa
      // http://.../bucket-name/shop1/products/img.jpg -> shop1/products/img.jpg
      const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) return; 
      
      const key = urlParts[1];

      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      }));
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }
  }
}
```
### 3. Integración con Productos

Ahora debemos actualizar el **Controller** y las **Routes** para aceptar archivos. Usaremos `multer` (middleware estándar de Node) para procesar el `multipart/form-data`.

#### Actualizar Rutas (`product.routes.ts`)


http://googleusercontent.com/immersive_entry_chip/3

#### Actualizar Controlador (`product.controller.ts`)

Aquí inyectamos el servicio de almacenamiento.


http://googleusercontent.com/immersive_entry_chip/4

### Resumen de la Lógica

1.  **Frontend/Postman:** Envía un `POST` multipart/form-data.
    * `x-tenant-id`: `shop1`
    * `name`: "Remera"
    * `image`: (Archivo binario)
2.  **Ruta:** Multer intercepta el archivo y lo pone en `req.file` (en memoria).
3.  **Controlador:**
    * Llama a `storageService.uploadProductImage("shop1", file)`.
    * El servicio construye la ruta `shop1/products/uuid.jpg`.
    * Sube a MinIO.
    * Devuelve `http://localhost:9000/bucket/shop1/products/uuid.jpg`.
4.  **Base de Datos:** Se guarda el producto con esa URL.

Esto está **totalmente optimizado** para migrar a AWS: el día de mañana, solo cambias las credenciales en `.env` y quitas el `forcePathStyle` (o dejas que la variable de entorno `NODE_ENV` lo maneje), y apuntará automáticamente al S3 real sin cambiar ni una línea de código.