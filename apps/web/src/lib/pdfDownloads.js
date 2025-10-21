import { API_ROUTES } from '@/config/api';

export const getPDFLink = async (orderId, appointmentId, sessionId) => {
    try {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 1. Obtener la URL de descarga del PDF
        const response = await fetch(API_ROUTES.INSPECTION_ORDERS.PDF_DOWNLOAD_URL(orderId, appointmentId, sessionId), {
            headers
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error obteniendo URL de descarga');
        }
        const { downloadUrl, fileName } = data.data;
        return { downloadUrl, fileName };
    } catch (error) {
        console.error('Error obteniendo el enlace de descarga del PDF:', error);
    }
}