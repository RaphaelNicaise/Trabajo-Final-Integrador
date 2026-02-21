import { Request, Response } from 'express';
import { ConfigurationService } from '../services/configuration.service';

const configService = new ConfigurationService();

export class ConfigurationController {

    async getAll(req: Request, res: Response) {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) return res.status(400).json({ error: 'x-tenant-id header is required' });

            const configs = await configService.getAll(tenantId, false);
            res.json(configs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPublic(req: Request, res: Response) {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) return res.status(400).json({ error: 'x-tenant-id header is required' });

            const configs = await configService.getAll(tenantId, true);
            res.json(configs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async upsert(req: Request, res: Response) {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) return res.status(400).json({ error: 'x-tenant-id header is required' });

            const { configs } = req.body;
            if (!Array.isArray(configs)) {
                return res.status(400).json({ error: '`configs` must be an array of configuration objects' });
            }

            const results = [];
            for (const config of configs) {
                const { key, value, description, isPublic } = config;
                if (!key || value === undefined) {
                    results.push({ key, error: 'Key and value are required' });
                    continue;
                }
                try {
                    const savedConfig = await configService.upsert(tenantId, key, value, description, isPublic);
                    results.push(savedConfig);
                } catch (e: any) {
                    results.push({ key, error: e.message });
                }
            }

            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) return res.status(400).json({ error: 'x-tenant-id header is required' });

            const { key } = req.params;
            if (!key) return res.status(400).json({ error: 'Key is required' });

            await configService.delete(tenantId, key);
            res.json({ message: 'Configuration deleted' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
