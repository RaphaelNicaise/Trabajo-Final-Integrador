import dotenv from "dotenv";
import mongoose, { Connection } from 'mongoose';

dotenv.config();

// Variable para almacenar la conexión única al clúster
let clusterConnection: Connection | null = null;

/**
 * Inicializa la conexión principal a MongoDB.
 * Debe llamarse al iniciar el servidor (index.ts/server.ts).
 */
export const connectToMongoDB = async (): Promise<void> => {
  try {
    
    // createConnection retorna una instancia, no usa la conexión global de mongoose
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        throw new Error('CRITICAL ERROR: MONGO_URI no está definida en las variables de entorno.');
    }

    clusterConnection = await mongoose.createConnection(mongoURI, {
      maxPoolSize: 10, 
    }).asPromise();

    console.log(`Conexión exitosa al clúster de MongoDB en el puerto ${mongoURI}.`);
    
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Obtiene la conexión a una base de datos específica de un Tenant (Tienda).
 * Utiliza `useDb` para reutilizar la conexión física existente (Socket).
 * * @param dbName El nombre de la base de datos (ej: "db_shop1")
 * @returns La instancia de conexión a esa base de datos
 */
export const getTenantDB = (dbName: string): Connection => {
  if (!clusterConnection) {
    throw new Error('La conexión a MongoDB no ha sido inicializada.');
  }

  // useDb(name, options): Crea una conexión lógica compartiendo el pool.
  // useCache: true asegura que si pedimos "db_shop1" varias veces, 
  // nos devuelva la misma instancia de conexión lógica cacheada.
  const tenantDb = clusterConnection.useDb(dbName, { useCache: true });
  
  return tenantDb;
};

/**
 * Obtiene la conexión a la base de datos de Metadatos (platform_meta).
 */
export const getMetaDB = (): Connection => {
  return getTenantDB('platform_meta');
}