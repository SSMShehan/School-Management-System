import api from './client';

export const staffApi = {
    getAll: async (skip = 0, limit = 100) => {
        const response = await api.get('/staff', { params: { skip, limit } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/staff/${id}`);
        return response.data;
    },

    create: async (staffData) => {
        const response = await api.post('/staff', staffData);
        return response.data;
    },

    update: async (id, staffData) => {
        const response = await api.put(`/staff/${id}`, staffData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/staff/${id}`);
    },
};

export default staffApi;
