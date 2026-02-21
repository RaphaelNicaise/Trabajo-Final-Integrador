import { getTenantDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { ConfigurationSchema, IConfiguration } from '../models/configuration.schema';

export class ConfigurationService {
    private getModel(shopSlug: string) {
        const dbName = `db_${shopSlug}`;
        const tenantConnection = getTenantDB(dbName);
        return getModelByTenant<IConfiguration>(tenantConnection, 'Configuration', ConfigurationSchema);
    }

    async getAll(shopSlug: string, isPublicOnly: boolean = false) {
        const ConfigModel = this.getModel(shopSlug);
        const query = isPublicOnly ? { isPublic: true } : {};
        return await ConfigModel.find(query).sort({ key: 1 });
    }

    async upsert(shopSlug: string, key: string, value: any, description?: string, isPublic: boolean = false) {
        const ConfigModel = this.getModel(shopSlug);
        // upsert: true means if it doesn't exist, create it. new: true returns the modified doc.
        return await ConfigModel.findOneAndUpdate(
            { key },
            { key, value, description, isPublic },
            { new: true, upsert: true, runValidators: true }
        );
    }

    async delete(shopSlug: string, key: string) {
        const ConfigModel = this.getModel(shopSlug);
        return await ConfigModel.findOneAndDelete({ key });
    }

    async getByKey(shopSlug: string, key: string) {
        const ConfigModel = this.getModel(shopSlug);
        return await ConfigModel.findOne({ key });
    }
}
