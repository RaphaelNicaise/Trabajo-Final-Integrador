import { 
  PutObjectCommand, 
  CreateBucketCommand,
  PutBucketPolicyCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { s3Client, BUCKET_NAME, PUBLIC_ENDPOINT } from '../../../config/s3';

export class StorageService {

  /**
   * Intenta crear el bucket directamente
   */
  async initializeMainBucket(): Promise<void> {
    try {
      // intentamos crear directamente y si falla es que ya existe
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`Bucket '${BUCKET_NAME}' creado.`);
      
    } catch (error: any) {
      const errorCode = error.name;
      const statusCode = error.$metadata?.httpStatusCode;

      if (
        errorCode === 'BucketAlreadyOwnedByYou' || 
        errorCode === 'BucketAlreadyExists' ||
        statusCode === 409
      ) {
        console.log(`Servicio de almacenamiento listo. Bucket '${BUCKET_NAME}'.`);
      } else {
        console.warn(`Advertencia: No se pudo crear el bucket (Code: ${statusCode}). Verifique MinIO.`);
        console.error('Detalle S3:', error.message);
      }
    }

    try {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicReadGetObject",
              Effect: "Allow",
              Principal: "*",
              Action: "s3:GetObject",
              Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
            }
          ]
        };

      await s3Client.send(new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy)
      }));

    } catch (error: any) {
      console.error('Error al aplicar política de bucket:', error.message);
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
      return `${PUBLIC_ENDPOINT}/${BUCKET_NAME}/${key}`;
    } catch (error) {
      console.error('Error subiendo imagen a MinIO:', error);
      throw new Error('Falló la subida de la imagen');
    }
  }

  async uploadLogoShop(shopSlug: string, file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${shopSlug}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3Client.send(command);
      return `${PUBLIC_ENDPOINT}/${BUCKET_NAME}/${key}`;
    } catch (error) {
      console.error('Error subiendo imagen a MinIO:', error);
      throw new Error('Falló la subida de la imagen');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
      
      if (urlParts.length >= 2) {
        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
      } else {
          console.warn('No se pudo extraer la key de la URL para borrar:', fileUrl);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
    }
  }

  async deleteShopFolder(shopSlug: string): Promise<void> {
    const prefix = `${shopSlug}/`;

    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix
      });
      const listedObjects = await s3Client.send(listCommand);

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`La carpeta ${prefix} ya estaba vacía o no existe.`);
        return;
      }

      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
      };

      await s3Client.send(new DeleteObjectsCommand(deleteParams));
      console.log(`Carpeta eliminada: ${prefix}`);

      if (listedObjects.IsTruncated) {
        await this.deleteShopFolder(shopSlug);
      }

    } catch (error) {
      console.error('Error eliminando carpeta de tienda:', error);
    }
  }
}