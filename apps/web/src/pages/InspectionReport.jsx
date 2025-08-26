import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText, Car, User, Calendar, MapPin, CheckCircle, XCircle, Clock, Camera, Wrench, Star, Download } from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import jsPDF from 'jspdf';
import { useAuth } from '@/contexts/auth-context';

const InspectionReport = () => {
    const { session_id } = useParams();
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef(null);
    const { user } = useAuth();

    // Nuevo estado para respuestas del checklist
    const [inspectionParts, setInspectionParts] = useState([]);
    const [partResponses, setPartResponses] = useState({});
    const [partComments, setPartComments] = useState({});
    const [categoryResponses, setCategoryResponses] = useState({});
    const [mechanicalTests, setMechanicalTests] = useState({});
    const [vehicleImages, setVehicleImages] = useState({});
    const [accessories, setAccessories] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [_checklist, setChecklist] = useState({});
    const [categoryComments, setCategoryComments] = useState({});
    const [vehicleImagesBySection, setVehicleImagesBySection] = useState({});
    const [_inspectionDetails, setInspectionDetails] = useState({});

    // Función para agrupar partes por categoría
    const groupPartsByCategory = () => {
        const grouped = {};
        inspectionParts.forEach(part => {
            // console.log(part)
            if (!part.category) return;

            const categoriaNombre = part.category.categoria;
            if (!grouped[categoriaNombre]) {
                grouped[categoriaNombre] = [];
            }
            grouped[categoriaNombre].push(part);
        });
        return grouped;
    };

    // Función para calcular puntajes del checklist
    const calculateChecklistScores = () => {
        const groupedParts = groupPartsByCategory();
        const categoryScores = {};
        let totalPercentSum = 0;
        let totalPercentCount = 0;
        let hasRejectionCriteria = false;
        let hasMinScoreRejection = false;

        Object.entries(groupedParts).forEach(([categoria, parts]) => {
            // Casos especiales: categorías de rechazo inmediato
            if (categoria === 'POLITICAS DE ASEGURABILIDAD "Estructura y Carroceria"' ||
                categoria === 'POLITICAS DE ASEGURABILIDAD "Sistema de identificación"') {
                const hasAnySelected = parts.some(part => {
                    const value = partResponses[part.id];
                    return value !== undefined && value !== "" && value !== null;
                });

                if (hasAnySelected) {
                    categoryScores[categoria] = 0; // 0% si hay alguna marcada
                    hasRejectionCriteria = true;
                } else {
                    categoryScores[categoria] = 100; // 100% si no hay ninguna marcada
                }

                // No sumar al total general, se maneja por separado
                return;
            }

            // Caso especial: POLITICAS DE ASEGURABILIDAD solo para observaciones
            if (categoria === 'POLITICAS DE ASEGURABILIDAD') {
                categoryScores[categoria] = null; // null indica que no tiene puntaje
                return;
            }

            let sumSelected = 0;
            let sumMax = 0;

            parts.forEach(part => {
                const value = partResponses[part.id];

                if (Array.isArray(part.opciones) && part.opciones.length > 0) {
                    // Para partes con opciones múltiples
                    const opt = part.opciones.find(opt => String(opt.value) === String(value));
                    if (value !== undefined && value !== "") {
                        const selectedValue = opt ? Number(opt.value) : 0;
                        sumSelected += selectedValue;
                    }
                    // Para máximo, tomamos el mayor value numérico
                    const maxOpt = part.opciones.reduce((max, opt) => Number(opt.value) > max ? Number(opt.value) : max, 0);
                    sumMax += maxOpt;
                } else {
                    // Para partes con bueno/regular/malo
                    if (value === 'bueno') {
                        sumSelected += Number(part.bueno);
                    } else if (value === 'regular') {
                        sumSelected += Number(part.regular);
                    } else if (value === 'malo') {
                        sumSelected += Number(part.malo);
                    }
                    // Usamos bueno como máximo para estas partes
                    sumMax += Number(part.bueno);
                }
            });

            // Calculamos porcentaje basado en valores seleccionados vs máximo posible
            const percent = sumMax > 0 ? (sumSelected / sumMax) * 100 : 0;
            categoryScores[categoria] = percent;

            // Verificar si la categoría cumple con el mínimo requerido
            const categoryMin = parts[0]?.minimo;
            if (categoryMin !== undefined && categoryMin > 0 && percent < categoryMin) {
                hasMinScoreRejection = true;
            }

            if (sumMax > 0) {
                totalPercentSum += percent;
                totalPercentCount++;
            }
        });

        // Si hay criterios de rechazo marcados o alguna categoría no cumple el mínimo, el puntaje general es 0%
        const generalScore = (hasRejectionCriteria || hasMinScoreRejection) ? 0 : (totalPercentCount > 0 ? (totalPercentSum / totalPercentCount) : 0);

        return { categoryScores, generalScore };
    };

    // Función para obtener el valor de respuesta formateado
    const getResponseValue = (part) => {
        // console.log(JSON.stringify(part, null, 2))
        const value = partResponses[part.id];
        if (!value) return 'No presenta';

        if (Array.isArray(part.opciones) && part.opciones.length > 0) {
            const opt = part.opciones.find(opt => String(opt.value) === String(value));
            return opt ? opt.label : value;
        } else {
            return value === 'bueno' ? 'Bueno' : value === 'regular' ? 'Regular' : value === 'malo' ? 'Malo' : value;
        }
    };

    // Función para calcular asegurabilidad basada en los datos reales
    const calculateAsegurabilidad = () => {

        // Verificar criterios de rechazo inmediato del checklist
        const hasRejectionCriteria = () => {
            if (!partResponses || Object.keys(partResponses).length === 0) {
                return false;
            }

            // Buscar respuestas en categorías de rechazo inmediato
            const rejectionCategories = [
                'POLITICAS DE ASEGURABILIDAD "Estructura y Carroceria"',
                'POLITICAS DE ASEGURABILIDAD "Sistema de identificación"'
            ];

            // Verificar si hay alguna respuesta marcada en estas categorías
            for (const [part_id, response] of Object.entries(partResponses)) {
                const part = inspectionParts.find(p => p.id.toString() === part_id.toString());
                if (part && part.category && rejectionCategories.includes(part.category.categoria)) {
                    if (response === 'checked' || response === true || response === 'si') {
                        return true;
                    }
                }
            }

            return false;
        };

        // Verificar fallas en pruebas mecanizadas
        const hasMechanicalFailures = () => {
            if (!mechanicalTests) return false;

            // Verificar suspensión
            if (mechanicalTests.suspension) {
                const suspensionValues = Object.values(mechanicalTests.suspension);
                if (suspensionValues.some(item => item.status && item.status !== 'BUENO')) {
                    return true;
                }
            }

            // Verificar frenos
            if (mechanicalTests.brakes) {
                if (mechanicalTests.brakes.eficaciaTotal && mechanicalTests.brakes.eficaciaTotal.status !== 'BUENO') {
                    return true;
                }
                if (mechanicalTests.brakes.frenoAuxiliar && mechanicalTests.brakes.frenoAuxiliar.status !== 'BUENO') {
                    return true;
                }
            }

            // Verificar alineación
            if (mechanicalTests.alignment && mechanicalTests.alignment.axes) {
                if (mechanicalTests.alignment.axes.some(axis => axis.status && axis.status !== 'BUENO')) {
                    return true;
                }
            }

            return false;
        };

        // Verificar puntaje mínimo no cumplido
        const hasMinScoreRejection = () => {
            if (!partResponses || !inspectionParts) return false;

            // Agrupar partes por categoría
            const groupedParts = inspectionParts.reduce((acc, part) => {
                if (!part.category) return acc;

                const categoria = part.category.categoria;
                if (!acc[categoria]) {
                    acc[categoria] = [];
                }
                acc[categoria].push(part);
                return acc;
            }, {});

            // Verificar cada categoría
            for (const [categoria, parts] of Object.entries(groupedParts)) {
                // Saltar categorías de rechazo inmediato y observaciones
                if (categoria.includes('POLITICAS DE ASEGURABILIDAD') || categoria === 'OBSERVACIONES') {
                    continue;
                }

                // Calcular puntaje de la categoría
                let sumSelected = 0;
                let sumMax = 0;

                parts.forEach(part => {
                    const value = partResponses[part.id];

                    if (Array.isArray(part.opciones) && part.opciones.length > 0) {
                        const opt = part.opciones.find(opt => String(opt.value) === String(value));
                        if (value !== undefined && value !== "") {
                            sumSelected += opt ? Number(opt.value) : 0;
                        }
                        const maxOpt = part.opciones.reduce((max, opt) => Number(opt.value) > max ? Number(opt.value) : max, 0);
                        sumMax += maxOpt;
                    } else {
                        if (value === 'bueno') {
                            sumSelected += Number(part.bueno || 100);
                        } else if (value === 'regular') {
                            sumSelected += Number(part.regular || 50);
                        } else if (value === 'malo') {
                            sumSelected += Number(part.malo || 0);
                        }
                        sumMax += Number(part.bueno || 100);
                    }
                });

                const percent = sumMax > 0 ? (sumSelected / sumMax) * 100 : 0;
                const minRequired = parts[0]?.minimo;

                if (minRequired && percent < minRequired) {
                    return true;
                }
            }

            return false;
        };

        // Determinar asegurabilidad
        const rejectionCriteria = hasRejectionCriteria();
        const mechanicalFailures = hasMechanicalFailures();
        const minScoreRejection = hasMinScoreRejection();

        const isAsegurable = !rejectionCriteria && !mechanicalFailures && !minScoreRejection;

        let reason = '';
        if (rejectionCriteria) {
            reason = 'Criterios de rechazo inmediato detectados';
        } else if (mechanicalFailures) {
            reason = 'Fallas en pruebas mecanizadas';
        } else if (minScoreRejection) {
            reason = 'Puntaje mínimo no cumplido';
        } else {
            reason = 'Vehículo cumple todos los criterios';
        }

        return { isAsegurable, reason };
    };

    // Función para exportar a PDF
    const exportToPDF = async () => {
        if (!reportRef.current) return;

        setExporting(true);
        try {
            const element = reportRef.current;
            
            // Crear una copia del elemento con estilos inline para mejor compatibilidad
            const clonedElement = element.cloneNode(true);
            clonedElement.style.position = 'absolute';
            clonedElement.style.left = '-9999px';
            clonedElement.style.top = '0';
            clonedElement.style.width = '210mm';
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.fontFamily = 'Arial, sans-serif';
            document.body.appendChild(clonedElement);

            // Función para aplicar estilos específicos para PDF
            const applyPDFStyles = (element) => {
                try {
                    // Función helper para obtener clases de manera segura
                    const getClassNames = (el) => {
                        if (!el) return '';
                        if (typeof el.className === 'string') {
                            return el.className;
                        }
                        if (el.className && typeof el.className.toString === 'function') {
                            return el.className.toString();
                        }
                        if (el.classList && el.classList.toString) {
                            return el.classList.toString();
                        }
                        return '';
                    };

                    // Aplicar estilos específicos para gradientes y colores
                    const gradientElements = element.querySelectorAll('.bg-gradient-to-r, .bg-gradient-to-br');
                    gradientElements.forEach(el => {
                        try {
                            const classes = getClassNames(el);
                            if (classes.includes('from-blue-600') && classes.includes('to-indigo-700')) {
                                el.style.background = 'linear-gradient(to right, #2563eb, #4338ca) !important';
                            } else if (classes.includes('from-blue-50') && classes.includes('to-blue-100')) {
                                el.style.background = 'linear-gradient(to bottom right, #eff6ff, #dbeafe) !important';
                            } else if (classes.includes('from-green-50') && classes.includes('to-green-100')) {
                                el.style.background = 'linear-gradient(to bottom right, #f0fdf4, #dcfce7) !important';
                            } else if (classes.includes('from-purple-50') && classes.includes('to-purple-100')) {
                                el.style.background = 'linear-gradient(to bottom right, #faf5ff, #f3e8ff) !important';
                            } else if (classes.includes('from-orange-50') && classes.includes('to-orange-100')) {
                                el.style.background = 'linear-gradient(to bottom right, #fff7ed, #fed7aa) !important';
                            } else if (classes.includes('from-red-50') && classes.includes('to-red-100')) {
                                el.style.background = 'linear-gradient(to bottom right, #fef2f2, #fecaca) !important';
                            }
                        } catch (e) {
                            console.warn('Error aplicando gradiente:', e);
                        }
                    });

                    // Aplicar colores de texto específicos
                    const textElements = element.querySelectorAll('.text-white, .text-blue-100, .text-blue-600, .text-green-600, .text-purple-600, .text-orange-600, .text-red-600, .text-yellow-500');
                    textElements.forEach(el => {
                        try {
                            const classes = getClassNames(el);
                            if (classes.includes('text-white')) {
                                el.style.color = '#ffffff !important';
                            } else if (classes.includes('text-blue-100')) {
                                el.style.color = '#dbeafe !important';
                            } else if (classes.includes('text-blue-600')) {
                                el.style.color = '#2563eb !important';
                            } else if (classes.includes('text-green-600')) {
                                el.style.color = '#16a34a !important';
                            } else if (classes.includes('text-purple-600')) {
                                el.style.color = '#9333ea !important';
                            } else if (classes.includes('text-orange-600')) {
                                el.style.color = '#ea580c !important';
                            } else if (classes.includes('text-red-600')) {
                                el.style.color = '#dc2626 !important';
                            } else if (classes.includes('text-yellow-500')) {
                                el.style.color = '#eab308 !important';
                            }
                        } catch (e) {
                            console.warn('Error aplicando color de texto:', e);
                        }
                    });

                    // Aplicar colores de fondo específicos
                    const bgElements = element.querySelectorAll('.bg-blue-600, .bg-green-600, .bg-purple-600, .bg-orange-600, .bg-red-500, .bg-green-500, .bg-blue-500');
                    bgElements.forEach(el => {
                        try {
                            const classes = getClassNames(el);
                            if (classes.includes('bg-blue-600')) {
                                el.style.backgroundColor = '#2563eb !important';
                            } else if (classes.includes('bg-green-600')) {
                                el.style.backgroundColor = '#16a34a !important';
                            } else if (classes.includes('bg-purple-600')) {
                                el.style.backgroundColor = '#9333ea !important';
                            } else if (classes.includes('bg-orange-600')) {
                                el.style.backgroundColor = '#ea580c !important';
                            } else if (classes.includes('bg-red-500')) {
                                el.style.backgroundColor = '#ef4444 !important';
                            } else if (classes.includes('bg-green-500')) {
                                el.style.backgroundColor = '#22c55e !important';
                            } else if (classes.includes('bg-blue-500')) {
                                el.style.backgroundColor = '#3b82f6 !important';
                            }
                        } catch (e) {
                            console.warn('Error aplicando color de fondo:', e);
                        }
                    });

                    // Aplicar colores de bordes
                    const borderElements = element.querySelectorAll('.border-blue-200, .border-green-200, .border-purple-200, .border-orange-200, .border-red-200, .border-yellow-200');
                    borderElements.forEach(el => {
                        try {
                            const classes = getClassNames(el);
                            if (classes.includes('border-blue-200')) {
                                el.style.borderColor = '#bfdbfe !important';
                            } else if (classes.includes('border-green-200')) {
                                el.style.borderColor = '#bbf7d0 !important';
                            } else if (classes.includes('border-purple-200')) {
                                el.style.borderColor = '#ddd6fe !important';
                            } else if (classes.includes('border-orange-200')) {
                                el.style.borderColor = '#fed7aa !important';
                            } else if (classes.includes('border-red-200')) {
                                el.style.borderColor = '#fecaca !important';
                            } else if (classes.includes('border-yellow-200')) {
                                el.style.borderColor = '#fde68a !important';
                            }
                        } catch (e) {
                            console.warn('Error aplicando color de borde:', e);
                        }
                    });
                } catch (error) {
                    console.warn('Error en applyPDFStyles:', error);
                }
            };

            applyPDFStyles(clonedElement);

            // Convertir clases CSS a estilos inline para mejor compatibilidad
            const convertClassesToInlineStyles = (element) => {
                const elements = element.querySelectorAll('*');
                elements.forEach(el => {
                    const computedStyle = window.getComputedStyle(el);
                    const importantStyles = [
                        'background-color', 'background', 'color', 'border', 'border-radius',
                        'padding', 'margin', 'font-size', 'font-weight', 'text-align',
                        'display', 'flex-direction', 'justify-content', 'align-items',
                        'width', 'height', 'min-height', 'max-width', 'box-shadow'
                    ];
                    
                    importantStyles.forEach(style => {
                        const value = computedStyle.getPropertyValue(style);
                        if (value && value !== 'none' && value !== 'normal') {
                            el.style.setProperty(style, value, 'important');
                        }
                    });
                });
            };

            convertClassesToInlineStyles(clonedElement);

            // Configuración optimizada para html2canvas-pro
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: clonedElement.scrollWidth,
                height: clonedElement.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                logging: false,
                removeContainer: true,
                foreignObjectRendering: false,
                imageTimeout: 30000,
                ignoreElements: (element) => {
                    return element.tagName === 'SCRIPT' || 
                           element.tagName === 'STYLE' ||
                           element.classList.contains('fixed');
                },
                onclone: (clonedDoc) => {
                    // Asegurar que los estilos se apliquen correctamente en el clon
                    const clonedReport = clonedDoc.querySelector('[data-report-content]');
                    if (clonedReport) {
                        clonedReport.style.cssText = `
                            background: white !important;
                            color: black !important;
                            font-family: Arial, sans-serif !important;
                            line-height: 1.4 !important;
                        `;
                    }
                }
            });

            // Limpiar el elemento clonado
            document.body.removeChild(clonedElement);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add subsequent pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename
            const fileName = `Inspeccion_${inspection?.inspectionOrder?.numero || inspection?.inspectionOrder?.id || 'N/A'}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            pdf.save(fileName);
            
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Error al generar el PDF. Por favor, intente nuevamente.');
        } finally {
            setExporting(false);
        }
    };

    // Cargar datos de la inspección
    useEffect(() => {
        const loadInspectionData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const response = await fetch(API_ROUTES.INSPECTION_ORDERS.INSPECTION_REPORT(session_id), { headers });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                setInspection(data.inspectionData);

                // Procesar resultados de Promise.allSettled
                const partsResult = data.partsData;
                const responsesResult = data.responsesData;
                const categoryResponsesResult = data.categoryResponsesData;
                const mechanicalTestsResult = data.mechanicalTestsData;
                const imagesResult = data.imagesData;
                const accessoriesResult = data.accessoriesData;
                const recordingsResult = data.recordingsData;
                const checklistResult = data.checklistData;
                const categoryCommentsResult = data.categoryCommentsData;
                // vehicleImagesResult ya no se usa, se procesa en el endpoint unificado
                // const inspectionResult = inspectionData.status === 'fulfilled' ? inspectionData.value : {}; // Ya no se usa


                // Usar inspectionData que contiene la información completa de la inspección
                // El endpoint devuelve { success: true, appointment: { ... } }
                const inspectionDataToUse = data.inspectionData;

                setInspection(inspectionDataToUse);
                setInspectionParts(partsResult);

                // Procesar respuestas de partes
                const processedResponses = {};
                const processedPartComments = {};

                responsesResult.forEach(r => {
                    // Usar part_id en lugar de part_id
                    if (r.part_id && r.value) {
                        processedResponses[r.part_id] = r.value;
                    }

                    // Procesar comentarios de partes
                    if (r.comment && r.part_id) {
                        processedPartComments[r.part_id] = r.comment;
                    }
                });
                
                setPartResponses(processedResponses);
                setPartComments(processedPartComments);

                // Procesar respuestas de categorías
                const processedCategoryResponses = {};
                categoryResponsesResult.forEach(c => {
                    if (c.comment) {
                        processedCategoryResponses[c.category_id] = c.comment;
                    }
                });
                setCategoryResponses(processedCategoryResponses);

                // Procesar datos adicionales
                setMechanicalTests(mechanicalTestsResult);

                // Procesar imágenes del endpoint unificado
                if (imagesResult && imagesResult.success && imagesResult.data) {
                    // Procesar imágenes principales
                    const mainImages = {};
                    imagesResult.data.main_images.forEach(img => {
                        if (img.image_url) {
                            mainImages[img.slot] = {
                                url: img.image_url,
                                description: img.name || img.slot
                            };
                        }
                    });

                    // Procesar imágenes adicionales
                    const additionalImages = {};
                    imagesResult.data.additional_images.forEach(img => {
                        if (img.image_url) {
                            const key = `adicional_${img.id}`;
                            additionalImages[key] = {
                                url: img.image_url,
                                description: img.name || img.slot,
                                category: img.category
                            };
                        }
                    });

                    // Combinar todas las imágenes
                    const allImages = { ...mainImages, ...additionalImages };

                    setVehicleImages(allImages);
                    setVehicleImagesBySection({
                        'Imágenes Principales': Object.keys(mainImages).length,
                        'Imágenes Adicionales': Object.keys(additionalImages).length
                    });

                    console.log('✅ [PDFGenerator] Imágenes iniciales procesadas:', {
                        main: Object.keys(mainImages).length,
                        additional: Object.keys(additionalImages).length,
                        total: Object.keys(allImages).length
                    });
                } else {
                    console.warn('⚠️ [PDFGenerator] No se recibieron datos de imágenes válidos');
                    setVehicleImages({});
                    setVehicleImagesBySection({});
                }

                // Agregar nuevos estados para datos adicionales
                setAccessories(accessoriesResult);
                setRecordings(recordingsResult);
                setChecklist(checklistResult);
                setCategoryComments(categoryCommentsResult);
                // setVehicleImagesBySection ya se establece en el procesamiento de imágenes unificado
                setInspectionDetails(inspectionDataToUse);

                setLoading(false);

            } catch (error) {
                console.error('Error cargando datos de inspección:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session_id) {
            try {
                loadInspectionData();
            } catch (error) {
                console.clear();
                console.error('Error cargando datos de inspección:', error);
            }
        }
    }, [session_id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-blue-200">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Cargando datos de la inspección...</p>
                    <div className="mt-2 text-sm text-gray-500">Preparando reporte detallado</div>
                </div>
            </div>
        );
    }

    if (!inspection) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex justify-center items-center">
                <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-red-200 max-w-md">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-3">No se encontró la inspección</h2>
                    <p className="text-gray-600 mb-6">La inspección con ID {session_id} no existe o no tienes permisos para verla.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Botón de exporte flotante */}
            {/* <div className="fixed top-6 right-6 z-50">
                <button
                    onClick={exportToPDF}
                    disabled={exporting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Generando PDF...</span>
                        </>
                    ) : (
                        <>
                            <Download className="h-5 w-5" />
                            <span>Exportar PDF</span>
                        </>
                    )}
                </button>
            </div> */}

            <div className="max-w-7xl mx-auto p-6">
                {/* Contenido del reporte para PDF */}
                <div ref={reportRef} className="bg-white" data-report-content>
                    {/* Header Principal */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <FileText className="h-8 w-8" />
                                </div>
        <div>
                                    <h1 className="text-2xl font-bold">INSPECCIÓN DE ASEGURABILIDAD</h1>
                                    <p className="text-blue-100 mt-1">Reporte detallado de evaluación vehicular</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-blue-100">N° de Inspección</div>
                                <div className="text-xl font-bold">{inspection?.inspectionOrder?.numero || inspection?.inspectionOrder?.id || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Información de la inspección */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Calendar className="h-5 w-5 text-white" />
                    </div>
                                    <div>
                                        <div className="text-sm text-blue-600 font-medium">Fecha</div>
                                        <div className="font-semibold text-gray-800">{inspection?.scheduled_date ? inspection.scheduled_date : 'N/A'}</div>
                                    </div>
                        </div>
                    </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-green-600 p-2 rounded-lg">
                                        <Clock className="h-5 w-5 text-white" />
                        </div>
                                    <div>
                                        <div className="text-sm text-green-600 font-medium">Hora</div>
                                        <div className="font-semibold text-gray-800">{inspection?.scheduled_time ? inspection.scheduled_time : 'N/A'}</div>
                    </div>
                        </div>
                    </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-purple-600 p-2 rounded-lg">
                                        <MapPin className="h-5 w-5 text-white" />
                        </div>
                                    <div>
                                        <div className="text-sm text-purple-600 font-medium">Centro</div>
                                        <div className="font-semibold text-gray-800">{inspection?.Sede?.name || 'N/A'}</div>
                    </div>
                            </div>
                        </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-orange-600 p-2 rounded-lg">
                                        {(() => {
                                            const { isAsegurable } = calculateAsegurabilidad();
                                            return isAsegurable ? <CheckCircle className="h-5 w-5 text-white" /> : <XCircle className="h-5 w-5 text-white" />;
                                        })()}
                                            </div>
                                            <div>
                                        <div className="text-sm text-orange-600 font-medium">Asegurable</div>
                                        <div className="font-semibold text-gray-800">
                                            {(() => {
                                                const { isAsegurable } = calculateAsegurabilidad();
                                                return isAsegurable ? 'SI' : 'NO';
                                            })()}
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                            </div>

                        {/* Datos generales */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-blue-600" />
                                    DATOS DEL CLIENTE
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Nombre:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.nombre_cliente || 'N/A'}</span>
                        </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Identificación:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.num_doc || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Celular:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.celular_cliente || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600 font-medium">Correo:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.correo_cliente || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Car className="h-5 w-5 mr-2 text-blue-600" />
                                    DATOS DEL VEHÍCULO
                                </h2>
                            <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Placa:</span>
                                        <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">{inspection?.inspectionOrder?.placa || 'N/A'}</span>
                                            </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Marca/Modelo:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.marca || 'N/A'} {inspection?.inspectionOrder?.linea || ''}</span>
                                            </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Año:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.modelo || 'N/A'}</span>
                                        </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600 font-medium">Color:</span>
                                        <span className="font-semibold">{inspection?.inspectionOrder?.color || 'N/A'}</span>
                            </div>
                        </div>
                            </div>
                        </div>

                        {/* Calificaciones y Puntuaciones */}
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Star className="h-6 w-6 mr-3 text-yellow-500" />
                                CALIFICACIONES Y PUNTUACIONES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {calculateChecklistScores().generalScore?.toFixed(1) || '0'}%
                                    </div>
                                    <div className="text-sm text-blue-600 font-medium">Puntuación General</div>
                                    <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${calculateChecklistScores().generalScore || 0}%` }}
                                        ></div>
                            </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        {Object.keys(groupPartsByCategory()).length}
                        </div>
                                    <div className="text-sm text-green-600 font-medium">Categorías Evaluadas</div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 text-center">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">
                                        {inspectionParts.length}
                                        </div>
                                    <div className="text-sm text-purple-600 font-medium">Partes Evaluadas</div>
                                    </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 text-center">
                                    <div className="text-3xl font-bold text-orange-600 mb-2">
                                        {(() => {
                                            const { isAsegurable } = calculateAsegurabilidad();
                                            return isAsegurable ? 'APROBADO' : 'RECHAZADO';
                                        })()}
                            </div>
                                    <div className="text-sm text-orange-600 font-medium">Estado Final</div>
                        </div>
                            </div>
                        </div>

                    {/* Inspección Visual Completa */}
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Wrench className="h-6 w-6 mr-3 text-blue-600" />
                                INSPECCIÓN VISUAL COMPLETA
                            </h2>
                        {(() => {
                            const groupedParts = groupPartsByCategory();
                            const { categoryScores, generalScore } = calculateChecklistScores();

                            return (
                                    <div className="space-y-6">
                                    {/* Puntaje general */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-lg font-bold text-blue-800">Puntaje General del Vehículo</span>
                                                <span className="text-2xl font-bold text-blue-600">
                                                {generalScore.toFixed(1)}%
                                            </span>
                                        </div>
                                            <div className="w-full bg-blue-200 rounded-full h-3">
                                            <div
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${generalScore}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Categorías */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.entries(groupedParts).map(([categoria, parts]) => (
                                                <div key={categoria} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="font-bold text-gray-800 text-lg">{categoria}</h3>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-blue-600">
                                                    {categoryScores[categoria]?.toFixed(1) || 0}%
                                                </span>
                                                            <div className="w-20 bg-blue-200 rounded-full h-2 mt-1">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${categoryScores[categoria] || 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                            </div>

                                            {/* Partes de la categoría */}
                                                    <div className="space-y-3">
                                                {parts.map(part => (
                                                            <div key={part.id} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100">
                                                                <span className="text-gray-700 font-medium">{part.parte}</span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                    getResponseValue(part) === 'Bueno' ? 'bg-green-100 text-green-800' :
                                                                    getResponseValue(part) === 'Regular' ? 'bg-yellow-100 text-yellow-800' :
                                                                        getResponseValue(part) === 'Malo' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {getResponseValue(part)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Comentario de categoría */}
                                            {categoryResponses[parts[0]?.category?.id] && (
                                                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <div className="flex items-start">
                                                                <div className="text-yellow-600 mr-2 mt-0.5">💬</div>
                                                                <div>
                                                                    <div className="font-medium text-yellow-800 mb-1">Comentario:</div>
                                                                    <div className="text-sm text-yellow-700">{categoryResponses[parts[0].category.id]}</div>
                                                                </div>
                                                            </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                        </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Pruebas Mecanizadas */}
                    {mechanicalTests && Object.keys(mechanicalTests).length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Wrench className="h-6 w-6 mr-3 text-blue-600" />
                                    PRUEBAS MECANIZADAS
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {mechanicalTests.brakes && (
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                                Sistema de Frenos
                                            </h3>
                                            <div className="space-y-4">
                                            {mechanicalTests.brakes.eficaciaTotal && (
                                                    <div className="bg-white rounded-lg p-4 border border-red-200">
                                                <div className="flex justify-between items-center">
                                                            <span className="text-gray-700 font-medium">Eficacia Total:</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl font-bold text-red-600">
                                                            {mechanicalTests.brakes.eficaciaTotal.value}%
                                                        </span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                    mechanicalTests.brakes.eficaciaTotal.status === 'BUENO' ? 'bg-green-100 text-green-800' :
                                                            mechanicalTests.brakes.eficaciaTotal.status === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {mechanicalTests.brakes.eficaciaTotal.status}
                                                        </span>
                                                            </div>
                                                    </div>
                                                </div>
                                            )}
                                            {mechanicalTests.brakes.frenoAuxiliar && (
                                                    <div className="bg-white rounded-lg p-4 border border-red-200">
                                                <div className="flex justify-between items-center">
                                                            <span className="text-gray-700 font-medium">Freno Auxiliar:</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl font-bold text-red-600">
                                                            {mechanicalTests.brakes.frenoAuxiliar.value}%
                                                        </span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                    mechanicalTests.brakes.frenoAuxiliar.status === 'BUENO' ? 'bg-green-100 text-green-800' :
                                                            mechanicalTests.brakes.frenoAuxiliar.status === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {mechanicalTests.brakes.frenoAuxiliar.status}
                                                        </span>
                                                            </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {mechanicalTests.suspension && (
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                Sistema de Suspensión
                                            </h3>
                                            <div className="space-y-4">
                                                {Object.entries(mechanicalTests.suspension).map(([key, value]) => (
                                                    <div key={key} className="bg-white rounded-lg p-4 border border-green-200">
                                                <div className="flex justify-between items-center">
                                                            <span className="text-gray-700 font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl font-bold text-green-600">
                                                                    {value.value}%
                                                        </span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                    value.status === 'BUENO' ? 'bg-green-100 text-green-800' :
                                                                    value.status === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                    {value.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {mechanicalTests.alignment && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                                Alineación
                                            </h3>
                                            <div className="space-y-4">
                                            {mechanicalTests.alignment.axes && mechanicalTests.alignment.axes.map((axis, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700 font-medium">{axis.name}:</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl font-bold text-blue-600">
                                                            {axis.value} {axis.unit}
                                                        </span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                    axis.status === 'BUENO' ? 'bg-green-100 text-green-800' :
                                                            axis.status === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {axis.status}
                                                        </span>
                                                            </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </div>

                                {mechanicalTests.observations && (
                                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                        <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            Observaciones
                                        </h3>
                                        <div className="text-gray-700 bg-white rounded-lg p-4 border border-yellow-200">
                                            {mechanicalTests.observations}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Fotografías */}
                    {vehicleImages && Object.keys(vehicleImages).length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Camera className="h-6 w-6 mr-3 text-blue-600" />
                                    FOTOGRAFÍAS ANEXAS
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Object.entries(vehicleImages).map(([key, image]) => (
                                        <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            {image.url ? (
                                                <img
                                                    src={image.url}
                                                    alt={image.description || key}
                                                        className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                                <div className="text-center text-gray-500 text-xs flex flex-col items-center justify-center" style={{ display: image.url ? 'none' : 'flex' }}>
                                                    <div className="w-12 h-12 bg-gray-300 rounded-lg mb-2 flex items-center justify-center">
                                                        <Camera className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                {image.description || key}
                                            </div>
                                        </div>
                                            <div className="text-xs text-center mt-2 text-gray-600 font-medium">
                                            {image.description || key}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Listado de Accesorios */}
                    {Array.isArray(accessories) && accessories.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Car className="h-6 w-6 mr-3 text-blue-600" />
                                    LISTADO DE ACCESORIOS
                                </h2>
                            <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-xl overflow-hidden border border-gray-200">
                                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                                        <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Descripción
                                            </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Marca
                                            </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Referencia
                                            </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Cantidad
                                            </th>
                                        </tr>
                                    </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {accessories.map((accessory, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                    <div>
                                                            <div className="font-medium text-gray-900">{accessory.description || 'N/A'}</div>
                                                        {accessory.notes && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Notas: {accessory.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                    <td className="px-6 py-4 text-gray-900">{accessory.brand || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-gray-900">{accessory.reference || 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {accessory.quantity || 1} {accessory.unit || 'UN'}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Observaciones */}
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                                OBSERVACIONES
                            </h2>
                            <div className="space-y-6">
                            {/* Comentarios de partes individuales */}
                            {(() => {
                                const commentsList = [];
                                Object.entries(partComments).forEach(([part_id, comment]) => {
                                    const part = inspectionParts.find(p => p.id === parseInt(part_id));
                                    if (part && comment) {
                                        commentsList.push({
                                            partName: part.parte,
                                            categoryName: part.category?.categoria,
                                            comment: comment
                                        });
                                    }
                                });

                                if (commentsList.length > 0) {
                                    return (
                                        <div>
                                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                    Comentarios por Parte
                                                </h3>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {commentsList.map((item, index) => (
                                                        <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                                            <div className="font-semibold text-blue-800 mb-2">
                                                                {item.partName}
                                                        </div>
                                                            <div className="text-sm text-blue-600 mb-1">
                                                                Categoría: {item.categoryName}
                                                            </div>
                                                            <div className="text-gray-700 bg-white rounded-lg p-3 border border-blue-200">
                                                            {item.comment}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Si no hay observaciones */}
                            {Object.keys(categoryResponses).length === 0 &&
                                Object.keys(partComments).length === 0 &&
                                (!mechanicalTests.observations || mechanicalTests.observations.trim() === '') && (
                                        <div className="text-center py-12">
                                            <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
                                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <div className="text-gray-500 font-medium">Sin observaciones registradas</div>
                                                <div className="text-sm text-gray-400 mt-2">No se han registrado comentarios adicionales</div>
                                            </div>
                                    </div>
                                )}
                        </div>
                    </div>

                        {/* Footer con Políticas */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                            <div className="text-center">
                                <div className="font-bold text-blue-700 mb-3 text-lg">POLÍTICAS INSPECCIÓN</div>
                                <p className="text-gray-600 leading-relaxed">
                                    El análisis de los sistemas de identificación es única y exclusivamente para fines internos de MUNDIAL DE SEGUROS. 
                                    Este documento es confidencial y de uso interno.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectionReport;
