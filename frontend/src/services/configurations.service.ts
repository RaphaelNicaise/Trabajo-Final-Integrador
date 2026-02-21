import api from './api';

export interface Configuration {
    _id: string;
    key: string;
    value: any;
    description?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export const configurationsService = {
    getAll: async () => {
        // x-tenant-id injected by interceptor from activeShop in localStorage
        const response = await api.get('/configurations');
        return response.data as Configuration[];
    },

    getPublic: async () => {
        // x-tenant-id injected by interceptor from activeShop in localStorage
        const response = await api.get('/configurations/public');
        return response.data as Configuration[];
    },

    upsert: async (configs: { key: string, value: any, description?: string, isPublic?: boolean }[]) => {
        const response = await api.post('/configurations', { configs });
        return response.data;
    },

    delete: async (key: string) => {
        const response = await api.delete(`/configurations/${key}`);
        return response.data;
    }
};
