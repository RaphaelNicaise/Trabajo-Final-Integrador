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
        const TenantModel = getModelByTenant<ITenant>(
            metaConnection,
            "Tenant",
            TenantSchema
        );

        const user = await UserModel.findById(userId).select("associatedStores");
        if (!user) throw new Error("Usuario no encontrado");

        // Enrich associatedStores with imageUrl from Tenant
        const enrichedStores = await Promise.all(
            user.associatedStores.map(async (store: any) => {
                const tenant = await TenantModel.findById(store.tenantId).select("imageUrl");
                return {
                    ...store.toObject(),
                    imageUrl: tenant?.imageUrl || null
                };
            })
        );

        return enrichedStores;
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
            imageUrl?: string;
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
     * Solo el propietario (owner) puede eliminar la tienda.
     */
    async deleteShop(shopSlug: string, requestingUserId?: string) {
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

        // Verificar permisos si se proporciona requestingUserId
        if (requestingUserId) {
            const requestingMember = tenantToDelete.members.find(
                (m: any) => m.userId.toString() === requestingUserId
            );
            if (!requestingMember || requestingMember.role !== "owner") {
                throw new Error("Solo el propietario puede eliminar la tienda");
            }
        }

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

    /**
     * Obtiene los miembros de una tienda con sus datos de usuario.
     */
    async getMembers(shopSlug: string) {
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

        const tenant = await TenantModel.findOne({ slug: shopSlug });
        if (!tenant) throw new Error("Tienda no encontrada");

        // Enrich members with user data
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

    /**
     * Agrega un miembro (admin) a una tienda por email.
     */
    async addMember(shopSlug: string, email: string, requestingUserId: string) {
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

        const tenant = await TenantModel.findOne({ slug: shopSlug });
        if (!tenant) throw new Error("Tienda no encontrada");

        // Verificar que el que lo solicita es owner
        const requestingMember = tenant.members.find(
            (m: any) => m.userId.toString() === requestingUserId
        );
        if (!requestingMember || requestingMember.role !== "owner") {
            throw new Error("Solo el propietario puede agregar miembros");
        }

        // Buscar el usuario a agregar por email
        const userToAdd = await UserModel.findOne({ email: email.toLowerCase().trim() });
        if (!userToAdd) throw new Error("No se encontró un usuario con ese email");

        const userIdToAdd = (userToAdd as any)._id;

        // Verificar que no sea ya miembro
        const alreadyMember = tenant.members.find(
            (m: any) => m.userId.toString() === userIdToAdd.toString()
        );
        if (alreadyMember) throw new Error("Este usuario ya es miembro de la tienda");

        // Agregar al tenant.members
        await TenantModel.findByIdAndUpdate(tenant._id, {
            $push: {
                members: { userId: userIdToAdd, role: "admin" },
            },
        });

        // Agregar a user.associatedStores
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

        return {
            userId: userIdToAdd.toString(),
            name: userToAdd.name,
            email: userToAdd.email,
            role: "admin",
        };
    }

    /**
     * Elimina un miembro de una tienda.
     * - El owner puede eliminar cualquier admin (pero no a sí mismo).
     * - Un admin puede desasociarse a sí mismo.
     */
    async removeMember(shopSlug: string, memberUserId: string, requestingUserId: string) {
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

        const tenant = await TenantModel.findOne({ slug: shopSlug });
        if (!tenant) throw new Error("Tienda no encontrada");

        const requestingMember = tenant.members.find(
            (m: any) => m.userId.toString() === requestingUserId
        );
        if (!requestingMember) {
            throw new Error("No eres miembro de esta tienda");
        }

        const memberToRemove = tenant.members.find(
            (m: any) => m.userId.toString() === memberUserId
        );
        if (!memberToRemove) throw new Error("Miembro no encontrado");

        const isSelfRemoval = requestingUserId === memberUserId;

        if (isSelfRemoval) {
            // El owner no puede eliminarse a sí mismo para evitar tiendas sin dueño
            if (requestingMember.role === "owner") {
                throw new Error("El propietario no puede eliminarse a sí mismo");
            }
            // Un admin puede desasociarse a sí mismo — continúa
        } else {
            // Solo el owner puede eliminar a otros miembros
            if (requestingMember.role !== "owner") {
                throw new Error("Solo el propietario puede eliminar miembros");
            }
            // El owner no puede ser eliminado por nadie
            if (memberToRemove.role === "owner") {
                throw new Error("No se puede eliminar al propietario de la tienda");
            }
        }

        // Eliminar del tenant.members
        await TenantModel.findByIdAndUpdate(tenant._id, {
            $pull: {
                members: { userId: new Types.ObjectId(memberUserId) },
            },
        });

        // Eliminar de user.associatedStores
        await UserModel.findByIdAndUpdate(memberUserId, {
            $pull: {
                associatedStores: { tenantId: tenant._id },
            },
        });

        return { message: "Miembro eliminado exitosamente" };
    }
}
