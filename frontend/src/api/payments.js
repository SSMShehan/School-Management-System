import api from './client';

export const paymentsApi = {
    getAll: async (skip = 0, limit = 100, status = null) => {
        const params = { skip, limit };
        if (status) params.status_filter = status;
        const response = await api.get('/payments', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    getByStudent: async (studentId) => {
        const response = await api.get(`/payments/student/${studentId}`);
        return response.data;
    },

    create: async (paymentData) => {
        const response = await api.post('/payments', paymentData);
        return response.data;
    },

    update: async (id, paymentData) => {
        const response = await api.put(`/payments/${id}`, paymentData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/payments/${id}`);
    },

    downloadReceipt: async (id) => {
        const response = await api.get(`/payments/${id}/receipt`, {
            responseType: 'blob'
        });
        return response.data;
    }
};

export default paymentsApi;
