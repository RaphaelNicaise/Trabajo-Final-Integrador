import { 
  S3Client, 
  PutObjectCommand, 
  CreateBucketCommand 
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'platform-bucket';
const INTERNAL_ENDPOINT = process.env.S3_INTERNAL_ENDPOINT || 'http://minio:9000'; 
const PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.MINIO_ROOT_USER || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
  },
  endpoint: INTERNAL_ENDPOINT,
  forcePathStyle: true, // Requisito obligatorio para MinIO
});

export class StorageService {

  /**
   * Intenta crear el bucket directamente (Estrategia Idempotente).
   * SOLUCIÓN DEL CRASH: Eliminamos HeadBucketCommand.
   */
  async initializeMainBucket(): Promise<void> {
    try {
      
      // Intentamos crear directamente. Si ya existe, fallará con un error específico que controlaremos.
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ Bucket '${BUCKET_NAME}' creado exitosamente.`);
      
    } catch (error: any) {
      // Manejo de errores tolerante
      const errorCode = error.name;
      const statusCode = error.$metadata?.httpStatusCode;

      // Si el error es que ya existe (409 o códigos específicos), es un éxito.
      if (
        errorCode === 'BucketAlreadyOwnedByYou' || 
        errorCode === 'BucketAlreadyExists' ||
        statusCode === 409
      ) {
        console.log(`Servicio de almacenamiento listo. Bucket '${BUCKET_NAME}'.`);
      } else {
        // Si es otro error (incluso el 400), solo mostramos advertencia.
        // NO lanzamos 'throw error' para evitar que el servidor se caiga al iniciar.
        console.warn(`Advertencia: No se pudo crear el bucket (Code: ${statusCode}). Verifique MinIO.`);
        console.error('Detalle S3:', error.message);
      }
    }
  }

  /**
   * Sube una imagen de producto a la carpeta de la tienda.
   * Ruta: bucket/shopSlug/products/uuid.jpg
   */
  async uploadProductImage(shopSlug: string, file: Express.Multer.File): Promise<string> {
    
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    const key = `${shopSlug}/products/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3Client.send(command);
      
      // Construir URL Pública para el frontend
      // CORRECCIÓN: Usar variable pública (localhost) para que el navegador pueda ver la imagen
      const publicBaseUrl = PUBLIC_ENDPOINT
      
      return `${publicBaseUrl}/${BUCKET_NAME}/${key}`;

    } catch (error) {
      console.error('Error subiendo imagen a MinIO:', error);
      throw new Error('Falló la subida de la imagen');
    }
  }
}