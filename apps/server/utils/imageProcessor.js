import AzureBlobServiceReadOnly from './azureBlobService.js';

/**
 * Procesador de Imágenes para Inspecciones
 * Centraliza la lógica de procesamiento de imágenes con Azure Blob Storage
 */
class ImageProcessor {
    constructor() {
        this.azureBlobService = new AzureBlobServiceReadOnly();
    }

    /**
     * Procesar imágenes de una inspección
     * @param {Array} imageCaptures - Array de ImageCapture desde la base de datos
     * @param {number} expiresInMinutes - Minutos de validez del SAS token
     * @returns {Promise<Object>} Objeto con imágenes principales y adicionales procesadas
     */
    async processInspectionImages(imageCaptures, expiresInMinutes = 60) {
        try {
            if (!imageCaptures || imageCaptures.length === 0) {
                console.log('📭 No hay imágenes para procesar');
                return {
                    main_images: [],
                    additional_images: [],
                    total_count: 0
                };
            }

            console.log(`📸 Procesando ${imageCaptures.length} imágenes de inspección...`);
            console.log('📸 Datos de entrada:', imageCaptures.map(img => ({
                id: img.id,
                slot: img.slot,
                name: img.name,
                hasBlobName: !!img.blob_name
            })));

            // Procesar todas las imágenes con Azure Blob Service
            const processedImages = await this.azureBlobService.processImagesBatch(imageCaptures, expiresInMinutes);
            console.log('📸 Imágenes procesadas por Azure Blob Service:', processedImages.length);
            
            // Log detallado de las primeras 3 imágenes procesadas
            if (processedImages.length > 0) {
                console.log('📸 Muestra de imágenes procesadas:');
                processedImages.slice(0, 3).forEach((img, index) => {
                    console.log(`📸 Imagen ${index + 1}:`, {
                        id: img.id,
                        slot: img.slot,
                        slotType: typeof img.slot,
                        name: img.name,
                        url: img.url ? 'URL presente' : 'Sin URL',
                        urlType: img.urlType
                    });
                });
            }

            // Validar y separar imágenes principales y adicionales
            const validImages = processedImages.filter(img => {
                if (!img || typeof img.slot !== 'string') {
                    console.warn('⚠️ Imagen inválida encontrada:', {
                        id: img?.id,
                        slot: img?.slot,
                        slotType: typeof img?.slot
                    });
                    return false;
                }
                return true;
            });

            console.log('📸 Imágenes válidas después del filtro:', validImages.length);

            // Separar imágenes principales y adicionales
            const mainImages = validImages.filter(img => !img.slot.startsWith('adicional_'));
            const additionalImages = validImages.filter(img => img.slot.startsWith('adicional_'));

            console.log(`📸 Separación: ${mainImages.length} principales, ${additionalImages.length} adicionales`);

            // Formatear para el frontend
            const formatImage = (img) => ({
                id: img.id,
                slot: img.slot,
                name: img.name,
                description: img.name,
                category: img.category,
                url: img.url,
                urlType: img.urlType,
                hasSasToken: img.hasSasToken,
                created_at: img.created_at,
                blob_name: img.blob_name,
                error: img.error || null
            });

            const result = {
                main_images: mainImages.map(formatImage),
                additional_images: additionalImages.map(formatImage),
                total_count: validImages.length
            };

            console.log(`✅ Imágenes procesadas: ${result.main_images.length} principales, ${result.additional_images.length} adicionales`);
            console.log('📸 Resultado final:', {
                main_images_count: result.main_images.length,
                additional_images_count: result.additional_images.length,
                total_count: result.total_count
            });
            
            return result;

        } catch (error) {
            console.error('❌ Error procesando imágenes de inspección:', error);
            throw error;
        }
    }

    /**
     * Obtener URL de descarga individual
     * @param {string} blob_name - Nombre del blob
     * @param {number} expiresInMinutes - Minutos de validez
     * @returns {Promise<string>} URL con SAS token
     */
    async getDownloadUrl(blob_name, expiresInMinutes = 60) {
        return await this.azureBlobService.getDownloadUrl(blob_name, expiresInMinutes);
    }

    /**
     * Verificar si el servicio está disponible
     * @returns {Promise<boolean>} True si está disponible
     */
    async isAvailable() {
        return await this.azureBlobService.isAvailable();
    }

    /**
     * Procesar una sola imagen
     * @param {Object} imageData - Datos de la imagen
     * @param {number} expiresInMinutes - Minutos de validez
     * @returns {Promise<Object>} Imagen procesada
     */
    async processSingleImage(imageData, expiresInMinutes = 60) {
        try {
            return await this.azureBlobService.processImage(imageData, expiresInMinutes);
        } catch (error) {
            console.error('❌ Error procesando imagen individual:', error);
            throw error;
        }
    }
}

export default ImageProcessor;
