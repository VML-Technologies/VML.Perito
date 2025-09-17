import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';


/**
 * Azure Blob Service - Solo Lectura de Imágenes
 * Versión simplificada para únicamente leer y obtener URLs de imágenes
 */
class AzureBlobServiceReadOnly {
    constructor() {
        this.containerName = process.env.AZURE_BLOB_CONTAINER_NAME || 'real-time-recording-test';
        
        // Configuración temporal para testing
        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
            console.log('⚠️ AZURE_STORAGE_CONNECTION_STRING no configurado, usando configuración temporal');
            // Aquí necesitarías la connection string real de Azure
            // process.env.AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=peritovmlblobst;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net';
        }
        
        console.log('🔧 Configuración Azure Blob Storage:');
        console.log(`🔧 - Container: ${this.containerName}`);
        console.log(`🔧 - Connection String: ${process.env.AZURE_STORAGE_CONNECTION_STRING ? 'Configurado' : 'No configurado'}`);
        console.log(`🔧 - SAS Token: ${process.env.AZURE_STORAGE_SAS_TOKEN ? 'Configurado' : 'No configurado'}`);
        console.log(`🔧 - SAS URL: ${process.env.AZURE_STORAGE_SAS_URL ? 'Configurado' : 'No configurado'}`);
        
        // Intentar usar connection string primero, luego fallback a SAS token
        if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
            this.useSasToken = false;
            this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
            
            // Crear cliente usando connection string
            this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
            this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            
            console.log('🔗 Azure Blob Service (Read-Only) inicializado con connection string');
        } else if (process.env.AZURE_STORAGE_SAS_TOKEN && process.env.AZURE_STORAGE_SAS_URL) {
            this.useSasToken = true;
            this.sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
            this.sasUrl = process.env.AZURE_STORAGE_SAS_URL;
            
            // Crear cliente usando SAS token
            const fullUrl = this.sasToken.startsWith('?') ? this.sasUrl + this.sasToken : this.sasUrl + '?' + this.sasToken;
            this.blobServiceClient = new BlobServiceClient(fullUrl);
            this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            
            console.log('🔗 Azure Blob Service (Read-Only) inicializado con SAS token');
        } else {
            console.warn('⚠️ No hay configuración de Azure Storage disponible. Las imágenes se mostrarán usando URLs de fallback.');
            this.useSasToken = false;
            this.connectionString = null;
            this.blobServiceClient = null;
            this.containerClient = null;
        }
    }

    /**
     * Verificar si el servicio está disponible
     */
    async isAvailable() {
        try {
            // Si no hay configuración de Azure, retornar false pero no fallar
            if (!this.blobServiceClient || !this.containerClient) {
                console.warn('⚠️ Azure Blob Storage no configurado - usando URLs de fallback');
                return false;
            }

            // Verificar si el contenedor existe
            const exists = await this.containerClient.exists();
            if (!exists) {
                console.error('❌ Contenedor no existe:', this.containerName);
                return false;
            }
            
            // Intentar listar blobs para verificar permisos de lectura
            const iterator = this.containerClient.listBlobsFlat();
            await iterator.next();
            
            console.log('✅ Azure Blob Storage (Read-Only) está disponible y accesible');
            return true;
        } catch (error) {
            console.error('❌ Azure Blob Storage (Read-Only) no está disponible:', error.message);
            
            if (this.useSasToken) {
                if (error.statusCode === 403) {
                    console.error('🔒 Error de permisos: El token SAS no tiene permisos de lectura');
                } else if (error.statusCode === 404) {
                    console.error('📦 Error: El contenedor no existe');
                }
            }
            
            return false;
        }
    }

    /**
     * Obtener URL de descarga con SAS token para una imagen
     * @param {string} blob_name - Nombre del blob en Azure
     * @param {number} expiresInMinutes - Minutos de validez del token (default: 60)
     * @returns {Promise<string>} URL con SAS token
     */
    async getDownloadUrl(blob_name, expiresInMinutes = 60) {
        try {
            if (!blob_name || typeof blob_name !== 'string') {
                throw new Error('Nombre de blob inválido');
            }

            // Si no hay configuración de Azure, lanzar error para usar fallback
            if (!this.blobServiceClient || !this.containerClient) {
                throw new Error('Azure Blob Storage no configurado');
            }

            console.log(`🔍 Intentando acceder a blob: ${blob_name}`);
            console.log(`🔍 Container: ${this.containerName}`);
            console.log(`🔍 Connection String configurado: ${!!this.connectionString}`);
            console.log(`🔍 SAS Token configurado: ${!!this.sasToken}`);

            const blockBlobClient = this.containerClient.getBlockBlobClient(blob_name);
            
            // Verificar que el blob existe
            console.log(`🔍 Verificando existencia del blob...`);
            const exists = await blockBlobClient.exists();
            console.log(`🔍 Blob existe: ${exists}`);
            
            if (!exists) {
                throw new Error(`Blob no encontrado: ${blob_name}`);
            }

            // Generar URL con SAS token
            console.log(`🔍 Generando SAS token...`);
            const sasToken = await blockBlobClient.generateSasUrl({
                permissions: 'r', // Solo lectura
                expiresOn: new Date(new Date().valueOf() + expiresInMinutes * 60 * 1000)
            });

            console.log(`✅ URL con SAS token generada para: ${blob_name} (válida por ${expiresInMinutes} minutos)`);
            return sasToken;
        } catch (error) {
            console.error('❌ Error generando URL de descarga:', error.message);
            console.error('❌ Stack trace:', error.stack);
            throw error;
        }
    }

    /**
     * Obtener URL pública directa (sin SAS token)
     * Solo funciona si el contenedor tiene acceso público
     * @param {string} blob_name - Nombre del blob
     * @returns {string} URL pública directa
     */
    getPublicUrl(blob_name) {
        if (!blob_name || typeof blob_name !== 'string') {
            throw new Error('Nombre de blob inválido');
        }

        // Si no hay configuración de Azure, construir URL manualmente
        if (!this.containerClient) {
            const accountName = 'peritovmlblobstoragehot';
            const containerName = this.containerName;
            return `https://${accountName}.blob.core.windows.net/${containerName}/${blob_name}`;
        }

        const blockBlobClient = this.containerClient.getBlockBlobClient(blob_name);
        return blockBlobClient.url;
    }

    /**
     * Listar todas las imágenes de una sesión específica
     * @param {string} session_id - ID de la sesión
     * @returns {Promise<Array>} Lista de imágenes
     */
    async listSessionImages(session_id) {
        try {
            if (!session_id || typeof session_id !== 'string') {
                throw new Error('Session ID inválido');
            }

            const images = [];
            const prefix = `images/${session_id}/`;
            
            console.log(`🔍 Buscando imágenes para sesión: ${session_id}`);
            
            for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
                // Filtrar solo archivos de imagen
                if (this.isImageFile(blob.name)) {
                    images.push({
                        name: blob.name,
                        size: blob.properties.contentLength,
                        lastModified: blob.properties.lastModified,
                        url: `${this.containerClient.url}/${blob.name}`,
                        contentType: blob.properties.contentType,
                        blobName: blob.name
                    });
                }
            }
            
            console.log(`📸 Encontradas ${images.length} imágenes para sesión ${session_id}`);
            return images;
        } catch (error) {
            console.error('❌ Error listando imágenes de sesión:', error.message);
            throw error;
        }
    }

    /**
     * Obtener información de un blob específico
     * @param {string} blob_name - Nombre del blob
     * @returns {Promise<Object>} Información del blob
     */
    async getBlobInfo(blob_name) {
        try {
            if (!blob_name || typeof blob_name !== 'string') {
                throw new Error('Nombre de blob inválido');
            }

            const blockBlobClient = this.containerClient.getBlockBlobClient(blob_name);
            
            // Verificar que existe
            const exists = await blockBlobClient.exists();
            if (!exists) {
                throw new Error(`Blob no encontrado: ${blob_name}`);
            }

            // Obtener propiedades
            const properties = await blockBlobClient.getProperties();
            
            return {
                name: blob_name,
                size: properties.contentLength,
                contentType: properties.contentType,
                lastModified: properties.lastModified,
                url: blockBlobClient.url,
                metadata: properties.metadata || {}
            };
        } catch (error) {
            console.error('❌ Error obteniendo información del blob:', error.message);
            throw error;
        }
    }

    /**
     * Verificar si un archivo es una imagen
     * @param {string} filename - Nombre del archivo
     * @returns {boolean} True si es imagen
     */
    isImageFile(filename) {
        if (!filename || typeof filename !== 'string') {
            return false;
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        
        return imageExtensions.includes(extension);
    }

    /**
     * Obtener content type por extensión de archivo
     * @param {string} extension - Extensión del archivo
     * @returns {string} Content type
     */
    getContentType(extension) {
        if (!extension) return 'application/octet-stream';
        
        const ext = extension.toLowerCase();
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.gif':
                return 'image/gif';
            case '.bmp':
                return 'image/bmp';
            case '.webp':
                return 'image/webp';
            default:
                return 'application/octet-stream';
        }
    }

    /**
     * Verificar permisos del token SAS (solo si usa SAS token)
     * @returns {Promise<Object>} Estado de los permisos
     */
    async checkSasTokenPermissions() {
        if (!this.useSasToken) {
            return { valid: true, message: 'No es un token SAS' };
        }

        try {
            const permissions = {
                read: false,
                list: false
            };

            // Verificar permiso de lectura
            try {
                const iterator = this.containerClient.listBlobsFlat();
                await iterator.next();
                permissions.read = true;
                permissions.list = true;
            } catch (error) {
                if (error.statusCode === 403) {
                    permissions.read = false;
                    permissions.list = false;
                }
            }

            const missingPermissions = Object.entries(permissions)
                .filter(([_, hasPermission]) => !hasPermission)
                .map(([permission, _]) => permission);

            if (missingPermissions.length > 0) {
                return {
                    valid: false,
                    message: `Permisos faltantes: ${missingPermissions.join(', ')}`,
                    permissions
                };
            }

            return {
                valid: true,
                message: 'Token SAS válido con permisos de lectura',
                permissions
            };
        } catch (error) {
            return {
                valid: false,
                message: `Error verificando permisos: ${error.message}`,
                permissions: null
            };
        }
    }

    /**
     * Procesar imagen: obtener URL con SAS token o fallback
     * @param {Object} imageData - Datos de la imagen desde la base de datos
     * @param {number} expiresInMinutes - Minutos de validez del SAS token
     * @returns {Promise<Object>} Imagen procesada con URL válida
     */
    async processImage(imageData, expiresInMinutes = 60) {
        try {
            let image_url = imageData.image_url;
            let urlType = 'original';
            let hasSasToken = false;

            // Si tiene blob_name, intentar generar URL con SAS token
            if (imageData.blob_name) {
                try {
                    image_url = await this.getDownloadUrl(imageData.blob_name, expiresInMinutes);
                    urlType = 'azure_with_sas';
                    hasSasToken = image_url.includes('?sv=');
                    
                    console.log(`✅ URL con SAS token generada para imagen: ${imageData.blob_name}`);
                } catch (error) {
                    console.error(`❌ Error generando SAS token para ${imageData.blob_name}:`, error.message);
                    urlType = 'azure_error';
                    
                    // Fallback: construir URL pública de Azure
                    const publicUrl = this.getPublicUrl(imageData.blob_name);
                    image_url = publicUrl;
                    urlType = 'azure_public_fallback';
                    console.log(`⚠️ Usando URL pública de Azure como fallback: ${image_url}`);
                }
            } else if (imageData.image_url && !imageData.image_url.startsWith('http')) {
                // URL local relativa - no podemos construir URL completa sin host
                console.warn(`⚠️ URL relativa sin host disponible: ${imageData.image_url}`);
                image_url = imageData.image_url;
                urlType = 'relative_local';
            }

            return {
                id: imageData.id,
                image_url: imageData.image_url,
                name: imageData.name,
                category: imageData.category,
                slot: imageData.slot,
                blob_name: imageData.blob_name,
                created_at: imageData.created_at,
                url: image_url,
                urlType,
                hasSasToken
            };
        } catch (error) {
            console.error('❌ Error procesando imagen:', error.message);
            throw error;
        }
    }

    /**
     * Procesar múltiples imágenes en lote
     * @param {Array} imagesArray - Array de imágenes desde la base de datos
     * @param {number} expiresInMinutes - Minutos de validez del SAS token
     * @returns {Promise<Array>} Array de imágenes procesadas
     */
    async processImagesBatch(imagesArray, expiresInMinutes = 60) {
        try {
            console.log(`🔄 Procesando ${imagesArray.length} imágenes en lote...`);
            console.log('🔄 Datos de entrada al Azure Blob Service:', imagesArray.map(img => ({
                id: img.id,
                slot: img.slot,
                name: img.name,
                hasBlobName: !!img.blob_name,
                hasImageUrl: !!img.image_url
            })));
            
            const processedImages = await Promise.all(
                imagesArray.map(async (image, index) => {
                    try {
                        console.log(`🔄 Procesando imagen ${index + 1}/${imagesArray.length}: ID=${image.id}, slot=${image.slot}`);
                        const result = await this.processImage(image, expiresInMinutes);
                        console.log(`✅ Imagen ${image.id} procesada exitosamente`);
                        return result;
                    } catch (error) {
                        console.error(`❌ Error procesando imagen ${image.id}:`, error.message);
                        console.error(`❌ Datos de la imagen con error:`, image);
                        // Retornar imagen con error pero sin fallar todo el lote
                        return {
                            id: image.id,
                            image_url: image.image_url,
                            name: image.name,
                            category: image.category,
                            slot: image.slot,
                            blob_name: image.blob_name,
                            created_at: image.created_at,
                            url: image.image_url || '',
                            urlType: 'error',
                            hasSasToken: false,
                            error: error.message
                        };
                    }
                })
            );

            const successful = processedImages.filter(img => img.urlType !== 'error').length;
            const failed = processedImages.length - successful;
            
            console.log(`✅ Procesamiento completado: ${successful} exitosas, ${failed} fallidas`);
            
            return processedImages;
        } catch (error) {
            console.error('❌ Error procesando lote de imágenes:', error.message);
            throw error;
        }
    }
}

export default AzureBlobServiceReadOnly;
