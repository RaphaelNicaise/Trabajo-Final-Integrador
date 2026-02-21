import { Types } from "mongoose";
import { getMetaDB, getTenantDB } from "../../database/tenantConnection";
import { getModelByTenant } from "../../database/modelFactory";

import { TenantSchema, ITenant } from "../../platform/models/tenant.schema";
import { UserSchema, IUser } from "../../platform/models/user.schema";
import { StorageService } from "../../storage/services/storage.service";
import { CacheService } from "../../cache/services/cache.service";

const storageService = new StorageService();

export class ShopService {

    private readonly PLATFORM_RESOURCE = 'platform:shop';
    private readonly USER_SHOPS_RESOURCE = 'platform:user_shops';

    private getShopCacheKey(slug: string): string {
        return `${this.PLATFORM_RESOURCE}:${slug}`;
    }

    /**
     * Helper para generar la key de las tiendas asociadas a un usuario
     */
    private getUserShopsCacheKey(userId: string): string {
        return `${this.USER_SHOPS_RESOURCE}:${userId}`;
    }

    /**
     * Crea una tienda (Tenant) en la plataforma.
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
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        const UserModel = getModelByTenant<IUser>(metaConnection, "User", UserSchema);

        const user = await UserModel.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        const ownerEmail = user.email;

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

        // INVALIDACIÓN: El usuario ahora tiene una nueva tienda asociada
        await CacheService.delete(this.getUserShopsCacheKey(userId));

        return newTenant;
    }

    /**
     * Obtiene la lista de tiendas de un usuario con enriquecimiento de imagen.
     */
    async getUserShops(userId: string) {
        const cacheKey = this.getUserShopsCacheKey(userId);
        
        // 1. Intentar obtener lista enriquecida de caché
        const cached = await CacheService.get<any[]>(cacheKey);
        if (cached) return cached;

        const metaConnection = getMetaDB();
        const UserModel = getModelByTenant<IUser>(metaConnection, "User", UserSchema);
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);

        const user = await UserModel.findById(userId).select("associatedStores");
        if (!user) throw new Error("Usuario no encontrado");

        const enrichedStores = await Promise.all(
            user.associatedStores.map(async (store: any) => {
                // Buscamos la imagen del tenant (podría estar en su propia caché)
                const shopCacheKey = this.getShopCacheKey(store.slug);
                let tenant = await CacheService.get<ITenant>(shopCacheKey);

                if (!tenant) {
                    tenant = await TenantModel.findById(store.tenantId).select("imageUrl").lean();
                    if (tenant) await CacheService.set(shopCacheKey, tenant, 86400);
                }

                return {
                    ...store.toObject(),
                    imageUrl: tenant?.imageUrl || null
                };
            })
        );

        await CacheService.set(cacheKey, enrichedStores, 3600); // 1 hora para esta lista

        return enrichedStores;
    }

    /**
     * Actualiza los datos visuales de una tienda.
     */
    async updateShop(
        shopSlug: string,
        updateData: {
            storeName?: string;
            location?: string;
            description?: string;
            imageUrl?: string;
        }
    ) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        
        const updated = await TenantModel.findOneAndUpdate({ slug: shopSlug }, updateData, {
            new: true,
        }).lean();

        if (updated) {
            // INVALIDACIÓN: Datos de la tienda y branding han cambiado
            await CacheService.delete(this.getShopCacheKey(shopSlug));
            // Invalidamos por patrón para forzar refresco de las listas de usuarios que la ven
            await CacheService.deleteByPattern(`${this.USER_SHOPS_RESOURCE}:*`);
        }

        return updated;
    }

    /**
     * Elimina una tienda, su DB, sus archivos y limpia Redis.
     */
    async deleteShop(shopSlug: string, requestingUserId?: string) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        const UserModel = getModelByTenant<IUser>(metaConnection, "User", UserSchema);

        const tenantToDelete = await TenantModel.findOne({ slug: shopSlug });
        if (!tenantToDelete) return null;

        if (requestingUserId) {
            const requestingMember = tenantToDelete.members.find(
                (m: any) => m.userId.toString() === requestingUserId
            );
            if (!requestingMember || requestingMember.role !== "owner") {
                throw new Error("Solo el propietario puede eliminar la tienda");
            }
        }

        try {
            const dbName = `db_${shopSlug}`;
            const tenantConnection = getTenantDB(dbName);
            await tenantConnection.dropDatabase();
            console.log(`Base de datos ${dbName} eliminada.`);
        } catch (error) {
            console.error(`Error al borrar DB física ${shopSlug}:`, error);
        }

        await storageService.deleteShopFolder(shopSlug);

        const memberIds = tenantToDelete.members.map(m => m.userId);
        await UserModel.updateMany(
            { _id: { $in: memberIds } },
            { $pull: { associatedStores: { tenantId: tenantToDelete._id } } }
        );

        const deleted = await TenantModel.findByIdAndDelete(tenantToDelete._id);

        // INVALIDACIÓN TOTAL: Borramos la tienda y TODA la caché del tenant
        await CacheService.delete(this.getShopCacheKey(shopSlug));
        await CacheService.deleteByPattern(`tenant:${shopSlug}:*`);
        await CacheService.deleteByPattern(`${this.USER_SHOPS_RESOURCE}:*`);

        return deleted;
    }

    async getAllShops() {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        return await TenantModel.find().lean();
    }

    async getShopBySlug(shopSlug: string) {
        const cacheKey = this.getShopCacheKey(shopSlug);

        const cached = await CacheService.get<ITenant>(cacheKey);
        if (cached) return cached;

        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        const shop = await TenantModel.findOne({ slug: shopSlug }).lean();

        if (shop) {
            await CacheService.set(cacheKey, shop, 86400);
        }

        return shop;
    }

    async getMembers(shopSlug: string) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        const UserModel = getModelByTenant<IUser>(metaConnection, "User", UserSchema);

        const tenant = await TenantModel.findOne({ slug: shopSlug });
        if (!tenant) throw new Error("Tienda no encontrada");

        const enrichedMembers = await Promise.all(
            tenant.members.map(async (member: any) => {
                const user = await UserModel.findById(member.userId).select("name email");
                return {
                    userId: member.userId.toString(),
                    role: member.role,
                    name: user?.name || "Usuario desconocido",
                    email: user?.email || "",
                };
            })
        );

        return enrichedMembers;
    }

    async addMember(shopSlug: string, email: string, requestingUserId: string) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        const UserModel = getModelByTenant<IUser>(metaConnection, "User", UserSchema);

        const tenant = await TenantModel.findOne({ slug: shopSlug });
        if (!tenant) throw new Error("Tienda no encontrada");

        const requestingMember = tenant.members.find(
            (m: any) => m.userId.toString() === requestingUserId
        );
        if (!requestingMember || requestingMember.role !== "owner") {
            throw new Error("Solo el propietario puede agregar miembros");
        }

        const userToAdd = await UserModel.findOne({ email: email.toLowerCase().trim() });
        if (!userToAdd) throw new Error("No se encontró un usuario con ese email");

        const userIdToAdd = (userToAdd as any)._id;

        const alreadyMember = tenant.members.find(
            (m: any) => m.userId.toString() === userIdToAdd.toString()
        );
        if (alreadyMember) throw new Error("Este usuario ya es miembro de la tienda");

        await TenantModel.findByIdAndUpdate(tenant._id, {
            $push: { members: { userId: userIdToAdd, role: "admin" } },
        });

        await UserModel.findByIdAndUpdate(userIdToAdd, {
            $push: {
                associatedStores: {
                    tenantId: tenant._id,
                    slug: shopSlug,
                    storeName: tenant.storeName,
                    role: "admin",
                },
            },
        });

        // INVALIDACIÓN: La lista de tiendas de este nuevo miembro cambió
        await CacheService.delete(this.getUserShopsCacheKey(userIdToAdd.toString()));

        return {
            userId: userIdToAdd.toString(),
            name: userToAdd.name,
            email: userToAdd.email,
            role: "admin",
        };
    }

    async removeMember(shopSlug: string, memberUserId: string, requestingUserId: string) {
        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, "Tenant", TenantSchema);
        const UserModel = getModelByTenant<IUser>(metaConnection, "User", UserSchema);

        const tenant = await TenantModel.findOne({ slug: shopSlug });
        if (!tenant) throw new Error("Tienda no encontrada");

        const requestingMember = tenant.members.find(
            (m: any) => m.userId.toString() === requestingUserId
        );
        if (!requestingMember) throw new Error("No eres miembro de esta tienda");

        const memberToRemove = tenant.members.find(
            (m: any) => m.userId.toString() === memberUserId
        );
        if (!memberToRemove) throw new Error("Miembro no encontrado");

        const isSelfRemoval = requestingUserId === memberUserId;

        if (isSelfRemoval) {
            if (requestingMember.role === "owner") throw new Error("El propietario no puede eliminarse a sí mismo");
        } else {
            if (requestingMember.role !== "owner") throw new Error("Solo el propietario puede eliminar miembros");
            if (memberToRemove.role === "owner") throw new Error("No se puede eliminar al propietario de la tienda");
        }

        await TenantModel.findByIdAndUpdate(tenant._id, {
            $pull: { members: { userId: new Types.ObjectId(memberUserId) } },
        });

        await UserModel.findByIdAndUpdate(memberUserId, {
            $pull: { associatedStores: { tenantId: tenant._id } },
        });

        // INVALIDACIÓN: La lista de tiendas del usuario eliminado cambió
        await CacheService.delete(this.getUserShopsCacheKey(memberUserId));

        return { message: "Miembro eliminado exitosamente" };
    }
}