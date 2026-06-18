import api from './client';

export const studentsApi = {
    getAll: async (skip = 0, limit = 100) => {
        const response = await api.get('/students', { params: { skip, limit } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    getByStudentId: async (studentId) => {
        const response = await api.get(`/students/by-index/${studentId}`);
        return response.data;
    },

    create: async (studentData) => {
        const response = await api.post('/students', studentData);
        return response.data;
    },

    update: async (id, studentData) => {
        const response = await api.put(`/students/${id}`, studentData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/students/${id}`);
    },
};

export default studentsApi;
