import api from './client';

export const reportsApi = {
    getDashboardStats: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    },

    getFinancialSummary: async (startDate, endDate) => {
        const response = await api.get('/reports/finance', { params: { start_date: startDate, end_date: endDate } });
        return response.data;
    },

    getAttendanceReport: async (date) => {
        const response = await api.get('/reports/attendance', { params: { date } });
        return response.data;
    },

    getStudentDemographics: async () => {
        const response = await api.get('/reports/student-demographics');
        return response.data;
    }
};

export default reportsApi;
