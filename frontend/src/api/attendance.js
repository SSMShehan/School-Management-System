import api from './client';

export const attendanceApi = {
    // Student Attendance
    create: async (data) => {
        const response = await api.post('/attendance', data);
        return response.data;
    },
    getAll: async (skip = 0, limit = 100) => {
        const response = await api.get('/attendance', { params: { skip, limit } });
        return response.data;
    },
    getByStudent: async (studentId) => {
        const response = await api.get(`/attendance/student/${studentId}`);
        return response.data;
    },
    getByDate: async (date) => {
        const response = await api.get(`/attendance/date/${date}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/attendance/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/attendance/${id}`);
    },
};

export const staffAttendanceApi = {
    // Staff Attendance
    create: async (data) => {
        const response = await api.post('/staff-attendance', data);
        return response.data;
    },
    getAll: async (skip = 0, limit = 100) => {
        const response = await api.get('/staff-attendance', { params: { skip, limit } });
        return response.data;
    },
    getByStaff: async (staffId) => {
        const response = await api.get(`/staff-attendance/staff/${staffId}`);
        return response.data;
    },
    getByDate: async (date) => {
        const response = await api.get(`/staff-attendance/date/${date}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/staff-attendance/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/staff-attendance/${id}`);
    },
};

export default attendanceApi;
