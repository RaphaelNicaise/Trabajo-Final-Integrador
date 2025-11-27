    import { Types } from 'mongoose';
    import { getMetaDB } from '../../database/tenantConnection';
    import { getModelByTenant } from '../../database/modelFactory';

    import { TenantSchema, ITenant } from '../../platform/models/tenant.schema';
    import { UserSchema, IUser } from '../../platform/models/user.schema';


    export class ShopService {

    /**
     * Crea una tienda (Tenant) en la plataforma.
     * La base de datos física 'db_{slug}' se creará automáticamente
     * cuando se agregue el primer producto o categoría.
     */
    async createShop(data: { 
        userId: string, 
        slug: string, 
        storeName: string, 
        ownerEmail: string,
        location?: string,
        description?: string
    }) {
        const { userId, slug, storeName, ownerEmail, location, description } = data;

        const metaConnection = getMetaDB();
        const TenantModel = getModelByTenant<ITenant>(metaConnection, 'Tenant', TenantSchema);
        const UserModel = getModelByTenant<IUser>(metaConnection, 'User', UserSchema);

        // 2. Validar slug
        const existingTenant = await TenantModel.findOne({ slug });
        if (existingTenant) throw new Error('El nombre de la tienda (slug) ya está en uso.');

        const newTenant = new TenantModel({
        slug,
        dbName: `db_${slug}`,
        storeName,
        ownerEmail,
        location,
        description,
        members: [{ userId: new Types.ObjectId(userId), role: 'owner' }]
        });
        await newTenant.save();

        await UserModel.findByIdAndUpdate(userId, {
        $push: {
            associatedStores: {
            tenantId: newTenant._id,
            slug: slug,
            storeName: storeName,
            role: 'owner'
            }
        }
        });
        
        return newTenant;
    }

    /**
     * Obtiene la lista de tiendas de un usuario.
     */
    async getUserShops(userId: string) {
        const metaConnection = getMetaDB();
        const UserModel = getModelByTenant<IUser>(metaConnection, 'User', UserSchema);

        const user = await UserModel.findById(userId).select('associatedStores');
        if (!user) throw new Error('Usuario no encontrado');

        return user.associatedStores;
    }
    }