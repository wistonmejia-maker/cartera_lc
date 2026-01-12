import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const propertyService = {
    getAll: () => api.get('/properties').then(res => res.data),
    create: (data: { name: string; settings?: any }) => api.post('/properties', data).then(res => res.data),
    update: (id: string, data: { name?: string; settings?: any }) => api.put(`/properties/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/properties/${id}`).then(res => res.data),
};

export const historyService = {
    getAllByProperty: (propertyId: string) => api.get(`/history/${propertyId}`).then(res => res.data),
    create: (data: any) => api.post('/history', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/history/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/history/${id}`).then(res => res.data),
};

export const legalService = {
    getAllByProperty: (propertyId: string) => api.get(`/legal/${propertyId}`).then(res => res.data),
    create: (data: any) => api.post('/legal', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/legal/${id}`, data).then(res => res.data),
    addNovedad: (id: string, descripcion: string, etapa: string) => api.post(`/legal/${id}/novedad`, { descripcion, etapa }).then(res => res.data),
    closeCase: (id: string, fechaFin: string) => api.post(`/legal/${id}/close`, { fechaFin }).then(res => res.data),
};

export default api;
