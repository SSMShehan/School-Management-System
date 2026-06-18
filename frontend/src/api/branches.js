import api from './client';

export const branchesApi = {
    getAll: async (skip = 0, limit = 100) => {
        const response = await api.get('/branches', { params: { skip, limit } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/branches/${id}`);
        return response.data;
    },

    create: async (branchData) => {
        const response = await api.post('/branches', branchData);
        return response.data;
    },

    update: async (id, branchData) => {
        const response = await api.put(`/branches/${id}`, branchData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/branches/${id}`);
    },
};

export default branchesApi;
