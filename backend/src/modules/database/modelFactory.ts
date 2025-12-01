import { Connection, Model, Schema } from 'mongoose';

/**
 * Helper para obtener un modelo registrado en una conexión específica.
 * Evita re-compilar el modelo si ya existe en esa conexión.
 */
export const getModelByTenant = <T>(
  connection: Connection, 
  modelName: string, 
  schema: Schema<T>
): Model<T> => {
  
  // Revisar si el modelo ya está compilado en esta conexión específica
  if (connection.models[modelName]) {
    return connection.models[modelName] as Model<T>;
  }
  return connection.model<T>(modelName, schema);
};