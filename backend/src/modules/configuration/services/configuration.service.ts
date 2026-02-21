import { getTenantDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { ConfigurationSchema, IConfiguration } from '../models/configuration.schema';
import { CacheService } from '../../cache/services/cache.service'; // Importamos el servicio de caché

export class ConfigurationService {
    private readonly RESOURCE = 'configurations';

    private getModel(shopSlug: string) {
        const dbName = `db_${shopSlug}`;
        const tenantConnection = getTenantDB(dbName);
        return getModelByTenant<IConfiguration>(tenantConnection, 'Configuration', ConfigurationSchema);
    }

    private getCacheKey(shopSlug: string, suffix: string = 'all'): string {
        return `tenant:${shopSlug}:${this.RESOURCE}:${suffix}`;
    }

    async getAll(shopSlug: string, isPublicOnly: boolean = false) {
        const cacheSuffix = isPublicOnly ? 'public' : 'admin';
        const cacheKey = this.getCacheKey(shopSlug, cacheSuffix);

        const cached = await CacheService.get<IConfiguration[]>(cacheKey);
        if (cached) return cached;

        const ConfigModel = this.getModel(shopSlug);
        const query = isPublicOnly ? { isPublic: true } : {};
        const configs = await ConfigModel.find(query).sort({ key: 1 }).lean();

        await CacheService.set(cacheKey, configs, 3600);

        return configs;
    }

    async upsert(shopSlug: string, key: string, value: any, description?: string, isPublic: boolean = false) {
        const ConfigModel = this.getModel(shopSlug);
        
        const updatedConfig = await ConfigModel.findOneAndUpdate(
            { key },
            { key, value, description, isPublic },
            { new: true, upsert: true, runValidators: true }
        );

        // INVALIDACIÓN: Al modificar una config, borramos ambas listas (public y admin)
        // y también la entrada individual por key si existiera
        await CacheService.delete(this.getCacheKey(shopSlug, 'public'));
        await CacheService.delete(this.getCacheKey(shopSlug, 'admin'));
        await CacheService.delete(this.getCacheKey(shopSlug, `key:${key}`));

        return updatedConfig;
    }

    async delete(shopSlug: string, key: string) {
        const ConfigModel = this.getModel(shopSlug);
        const deleted = await ConfigModel.findOneAndDelete({ key });

        // INVALIDACIÓN: Limpiamos la caché
        await CacheService.delete(this.getCacheKey(shopSlug, 'public'));
        await CacheService.delete(this.getCacheKey(shopSlug, 'admin'));
        await CacheService.delete(this.getCacheKey(shopSlug, `key:${key}`));

        return deleted;
    }

    async getByKey(shopSlug: string, key: string) {
        const cacheKey = this.getCacheKey(shopSlug, `key:${key}`);

        const cached = await CacheService.get<IConfiguration>(cacheKey);
        if (cached) return cached;

        const ConfigModel = this.getModel(shopSlug);
        const config = await ConfigModel.findOne({ key }).lean();

        if (config) {
            await CacheService.set(cacheKey, config, 3600);
        }

        return config;
    }
}