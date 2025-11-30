import { Types } from "mongoose";
import { getMetaDB, getTenantDB } from "../../database/tenantConnection"; 
import { getModelByTenant } from "../../database/modelFactory";

import { TenantSchema, ITenant } from "../../platform/models/tenant.schema";
import { UserSchema, IUser } from "../../platform/models/user.schema";
import { StorageService } from "../../storage/services/storage.service"; 

const storageService = new StorageService();

export class ShopService {
    /**
     * Crea una tienda (Tenant) en la plataforma.
     * La base de datos física 'db_{slug}' se creará automáticamente
     * cuando se agregue el primer producto o categoría.
     */
    async createShop(data: {
        userId: string;
        slug: string;
        storeName: string;
        location?: string;
        description?: string;
    }) {
        const { userId, slug, storeName, location, description } = data;

        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(
            metaConnection,
            "Tenant",
            TenantSchema
        );
        const UserModel = getModelByTenant<IUser>(
            metaConnection,
            "User",
            UserSchema
        );

        // Obtener el email del usuario owner
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        const ownerEmail = user.email;

        // Validar slug
        const existingTenant = await TenantModel.findOne({ slug });
        if (existingTenant)
            throw new Error("El nombre de la tienda (slug) ya está en uso.");

        const newTenant = new TenantModel({
            slug,
            dbName: `db_${slug}`,
            storeName,
            ownerEmail,
            location,
            description,
            members: [{ userId: new Types.ObjectId(userId), role: "owner" }],
        });
        await newTenant.save();

        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                associatedStores: {
                    tenantId: newTenant._id,
                    slug: slug,
                    storeName: storeName,
                    role: "owner",
                },
            },
        });

        return newTenant;
    }

    /**
     * Obtiene la lista de tiendas de un usuario.
     */
    async getUserShops(userId: string) {
        const metaConnection = getMetaDB();
        const UserModel = getModelByTenant<IUser>(
            metaConnection,
            "User",
            UserSchema
        );

        const user = await UserModel.findById(userId).select("associatedStores");
        if (!user) throw new Error("Usuario no encontrado");

        return user.associatedStores;
    }
    /**
     * Actualiza los datos visuales de una tienda (no el slug ni el ownerEmail)
     */
    async updateShop(
        shopSlug: string,
        updateData: {
            storeName?: string;
            location?: string;
            description?: string;
        }
    ) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(
            metaConnection,
            "Tenant",
            TenantSchema
        );
        // Solo permitimos modificar datos visuales, NO el slug ni el ownerEmail
        return await TenantModel.findOneAndUpdate({ slug: shopSlug }, updateData, {
            new: true,
        });
    }

    /**
     * Elimina una tienda (Tenant) de la plataforma y actualiza los usuarios asociados.
     */
    async deleteShop(shopSlug: string) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(
            metaConnection,
            "Tenant",
            TenantSchema
        );
        const UserModel = getModelByTenant<IUser>(
            metaConnection,
            "User",
            UserSchema
        );
        
        const tenantToDelete = await TenantModel.findOne({ slug: shopSlug });

        if (!tenantToDelete) return null;

        // eliminar la db fisica
        try {
            const dbName = `db_${shopSlug}`;
            const tenantConnection = getTenantDB(dbName);
            await tenantConnection.dropDatabase();
            console.log(`Base de datos ${dbName} eliminada.`);
        } catch (error) {
            console.error(`Error al borrar DB física ${shopSlug}:`, error);
        }

        await storageService.deleteShopFolder(shopSlug); // elimina imagenes del minio

        const memberIds = tenantToDelete.members.map(m => m.userId); // le eliminamos a cada usuario la referencia a esta tienda
        await UserModel.updateMany(
            { _id: { $in: memberIds } },
            { 
                $pull: { 
                    associatedStores: { tenantId: tenantToDelete._id } 
                } 
            }
        );


        return await TenantModel.findByIdAndDelete(tenantToDelete._id);// y por ultimo eliminamos el Tenant de la plataforma
    }

    async getAllShops() {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(
            metaConnection,
            "Tenant",
            TenantSchema
        );
        return await TenantModel.find();
    }

    async getShopBySlug(shopSlug: string) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(
            metaConnection,
            "Tenant",
            TenantSchema
        );
        return await TenantModel.findOne({ slug: shopSlug });
    }
}
