"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API_ROUTES } from "@/config/api"
import Logo from "@/assets/logo.svg"
import "@/styles/print.css"
// Using browser print function for tabloid landscape format
import {
  Loader2,
  FileText,
  Car,
  User,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Gauge,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const InspectionReport = () => {
  const { session_id, inspectionOrderId, appointmentId } = useParams()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewMedia, setPreviewMedia] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allowDownload = false

  const fetchInspectionReport = async () => {
    try {
      let response;

      // Determinar qué tipo de ruta estamos usando
      if (inspectionOrderId && appointmentId) {
        // Nueva ruta con IDs específicos
        console.log(`🔍 Cargando reporte con inspectionOrderId: ${inspectionOrderId}, appointmentId: ${appointmentId}`);
        response = await fetch(API_ROUTES.INSPECTION_ORDERS.INSPECTION_REPORT_BY_IDS(inspectionOrderId, appointmentId));
      } else if (session_id) {
        // Ruta antigua con session_id
        console.log(`🔍 Cargando reporte con session_id: ${session_id}`);
        response = await fetch(API_ROUTES.INSPECTION_ORDERS.FULL_REPORT(session_id));
      } else {
        throw new Error('No se proporcionaron los parámetros necesarios para cargar el reporte');
      }

      const data = await response.json()
      if (data?.data?.appointments?.[0]?.images) {
        const images = data.data.appointments[0].images
        if (images.error) {
          console.error("🔍 [InspectionReport] Error en imágenes:", images.error)
        }
      }
      setReportData(data)
    } catch (error) {
      console.error("Error al cargar el reporte:", error)
    } finally {
      setLoading(false)
    }
  }
  const formatImageLabel = (imgLabel) => {
    // split by _ andcapitalize
    const parts = imgLabel.split('_')
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  }
  const handlePrint = () => {
    // Abrir ventana de impresión del navegador
    // Los estilos de impresión ya están definidos en print.css
    window.print()
  }

  const getStatusInfo = (estado) => {
    switch (estado) {
      case "aprobado":
        return { color: "text-green-600 bg-green-50", icon: CheckCircle, text: "Aprobado" }
      case "rechazado":
        return { color: "text-red-600 bg-red-50", icon: XCircle, text: "Rechazado" }
      case "observacion":
        return { color: "text-yellow-600 bg-yellow-50", icon: AlertCircle, text: "Observación" }
      default:
        return { color: "text-gray-600 bg-gray-50", icon: AlertCircle, text: "N/A" }
    }
  }

  const getOptionLabel = (opciones, responseValue) => {
    if (!opciones || !responseValue) return responseValue || "Sin respuesta"

    try {
      const options = JSON.parse(opciones)
      const matchingOption = options.find((option) => option.value.toString() === responseValue.toString())
      return matchingOption ? matchingOption.label : responseValue
    } catch (error) {
      console.error("Error parsing opciones:", error)
      return responseValue || "Sin respuesta"
    }
  }

  const getActualScore = (result) => {
    // Si el puntaje calculado es 0 pero hay respuestas válidas, calcular el puntaje real
    if (result.puntaje === 0 && result.parts && result.parts.length > 0) {
      const validParts = result.parts.filter(part => part.hasResponse && part.responseValue)
      if (validParts.length > 0) {
        const totalScore = validParts.reduce((sum, part) => {
          const score = parseInt(part.responseValue) || 0
          return sum + score
        }, 0)
        return Math.round(totalScore / validParts.length)
      }
    }
    return result.puntaje
  }

  const getScoreLabel = (result) => {
    // Solo aplicar esta lógica a las 4 categorías específicas
    const specificCategories = ["Tapicería", "Llantas", "Pintura", "Fluidos"]

    if (specificCategories.includes(result.categoria) && result.parts && result.parts.length > 0) {
      const part = result.parts[0] // Usar siempre la primera parte para estas categorías
      if (part.hasResponse && part.responseValue && part.opciones) {
        try {
          const options = JSON.parse(part.opciones)
          const matchingOption = options.find((option) => option.value.toString() === part.responseValue.toString())
          return matchingOption ? matchingOption.label : part.responseValue
        } catch (error) {
          console.error("Error parsing opciones:", error)
          return part.responseValue
        }
      }
    }
    return null
  }

  const getPartMinimo = (result) => {
    // Solo aplicar esta lógica a las 4 categorías específicas
    const specificCategories = ["Tapicería", "Llantas", "Pintura", "Fluidos"]

    if (specificCategories.includes(result.categoria) && result.parts && result.parts.length > 0) {
      const part = result.parts[0] // Usar siempre la primera parte para estas categorías
      return part.minimo || result.minimo
    }
    return result.minimo
  }

  const getCorrectStatus = (result) => {
    // Solo aplicar esta lógica a las 4 categorías específicas
    const specificCategories = ["Tapicería", "Llantas", "Pintura", "Fluidos"]

    if (specificCategories.includes(result.categoria)) {
      const actualScore = getActualScore(result)
      const partMinimo = getPartMinimo(result)

      // Si el puntaje real está por encima del mínimo, es aprobado
      if (actualScore >= partMinimo) {
        return "aprobado"
      } else {
        return "rechazado"
      }
    }

    // Para otras categorías, usar el estado original
    return result.estado
  }

  // Función para obtener el estado de asegurabilidad desde el backend
  const getAsegurabilidadStatus = () => {
    if (!calculatedData?.asegurabilidad) {
      return { isAsegurable: false, reason: 'Datos no disponibles' }
    }
    return calculatedData.asegurabilidad
  }

  // Funciones para manejo de imágenes
  const handleMediaClick = (media) => {
    setPreviewMedia(media)
    setShowPreviewModal(true)

    // Encontrar el índice de la imagen actual
    const allImages = [...(appointment?.images?.main_images || []), ...(appointment?.images?.additional_images || [])]
    const index = allImages.findIndex(img => img.id === media.id)
    setCurrentImageIndex(index >= 0 ? index : 0)
  }

  const closePreviewModal = () => {
    setShowPreviewModal(false)
    setPreviewMedia(null)
    setCurrentImageIndex(0)
  }

  const navigateImage = (direction) => {
    const allImages = [...(appointment?.images?.main_images || []), ...(appointment?.images?.additional_images || [])]
    if (allImages.length <= 1) return

    let newIndex
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % allImages.length
    } else {
      newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1
    }

    setCurrentImageIndex(newIndex)
    setPreviewMedia(allImages[newIndex])
  }

  const downloadMedia = async (media) => {
    try {
      if (!media.url || typeof media.url !== 'string' || media.url.trim() === '') {
        console.error('❌ URL inválida para descarga:', media)
        return
      }

      // Crear enlace temporal para descarga
      const a = document.createElement('a')
      a.href = media.url
      a.download = media.name || `imagen_${media.id}`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

    } catch (error) {
      console.error('❌ Error descargando archivo:', error)
    }
  }

  const downloadAllImages = async (imagesData) => {
    try {
      const allImages = [...(imagesData.main_images || []), ...(imagesData.additional_images || [])]

      for (const image of allImages) {
        if (image.url) {
          await downloadMedia(image)
          // Pequeño delay entre descargas
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

    } catch (error) {
      console.error('Error descargando imágenes:', error)
    }
  }

  const formatImageDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('es-CO')
  }

  useEffect(() => {
    fetchInspectionReport()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reporte de inspección...</span>
      </div>
    )
  }

  if (!reportData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No se encontró el reporte</h2>
          <p className="text-gray-500">El reporte de inspección no está disponible</p>
        </div>
      </div>
    )
  }

  const leadZero = (number) => {
    return number < 10 ? `0${number}` : number
  }

  const formatDate = (dateString) => {
    console.log("Formatting date:", dateString)

    // Si la fecha viene con formato ISO (con T y Z), usar UTC para evitar problemas de zona horaria
    if (dateString.includes('T')) {
      const date = new Date(dateString)
      const year = date.getUTCFullYear()
      const month = date.getUTCMonth() + 1
      const day = date.getUTCDate()
      console.log("Formatted date (UTC):", `${year}-${leadZero(month)}-${leadZero(day)}`)
      return <>
        {`${year}-${leadZero(month)}-${leadZero(day)}`}
      </>
    } else {
      // Si es solo una fecha (YYYY-MM-DD)
      const dateParts = dateString.split('-')
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0])
        const month = parseInt(dateParts[1])
        const day = parseInt(dateParts[2])
        console.log("Formatted date (direct parse):", `${year}-${leadZero(month)}-${leadZero(day)}`)
        return <>
          {`${year}-${leadZero(month)}-${leadZero(day)}`}
        </>
      }

      // Fallback al método original
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      console.log("Formatted date (fallback):", `${year}-${leadZero(month)}-${leadZero(day)}`)
      return <>
        {`${year}-${leadZero(month)}-${leadZero(day)}`}
      </>
    }
  }

  // Format time
  const formatTime = (dateString) => {
    let date = new Date(dateString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    return <>
      {`${leadZero(hours)}:${leadZero(minutes)}:${leadZero(seconds)}`}
    </>
  }

  const data = reportData.data
  const appointment = data.appointments?.[0]
  const inspectionResults = appointment?.inspectionResults || []
  const mechanicalTests = appointment?.mechanicalTests || {}
  const calculatedData = appointment?.calculatedData || {}

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      <div id="inspection-report-content" className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between">
          <div className="text-2xl font-bold">
            <div>
              Movilidad Mundial
            </div>
            <div className="text-sm text-gray-500">
              Reporte de inspeccion
            </div>
          </div>
          <div>
            <div className="flex justify-end gap-2">

              <img src={Logo} alt="Movilidad Mundial" className="h-10" />
            </div>
            <div>
              Orden de inspeccion #{data.numero}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalles</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-base font-bold text-blue-600">Creacion de la orden</div>
              <div className="text-xs text-gray-700 mb-1">Fecha</div>
              {/* YYY-mm-dd */}
              <div className="text-xs text-gray-500 mb-1">{formatDate(data.fecha_creacion)}</div>
              <div className="text-xs text-gray-700 mb-1">Hora</div>
              <div className="text-xs text-gray-500 mb-1">{formatTime(data.fecha_creacion)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-base font-bold text-blue-600">Inspeccion programada</div>
              <div className="text-xs text-gray-700 mb-1">Fecha</div>
              <div className="text-xs text-gray-500 mb-1">{formatDate(appointment?.scheduled_date)}</div>

              <div className="text-xs text-gray-700 mb-1">Hora</div>
              <div className="text-xs text-gray-500 mb-1">{appointment?.scheduled_time}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-base font-bold text-blue-600">Contacto Principal</div>
              <div className="text-xs text-gray-500 mb-1">{data.nombre_contacto}</div>
              <div className="text-xs text-gray-500 mb-1">{data.celular_contacto}</div>
              <div className="text-xs text-gray-500 mb-1">{data.correo_contacto}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-base font-bold text-blue-600">Cliente</div>
              <div className="text-xs text-gray-500 mb-1">{data.nombre_cliente}</div>
              <div className="text-xs text-gray-500 mb-1">{data.celular_cliente}</div>
              <div className="text-xs text-gray-500 mb-1">{data.correo_cliente}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="rounded-lg">
                <div className="text-center">
                  <div className="text-base font-bold text-blue-600">Estado de Asegurabilidad</div>
                  <div className="text-lg text-black mt-1 font-mono font-bold">{data.inspection_result}</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Contact Information */}
        {
          (data?.inspection_result_details) ? <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">Detalles de resultado</h2>
              </div>
              <div className="">
                {
                  data?.inspection_result_details
                }
              </div>
            </div>
          </> : <></>
        }

        {/* Vehicle Information Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Resumen de Inspección</h2>
          </div>

          {/* Bento Box Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto">

            {/* Imagen del Vehículo - Ocupa 4 columnas */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm h-full">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-inner">
                  <img
                    src={appointment.images?.main_images?.find(image => image.slot === 'esquina_frontal_izq')?.url}
                    alt="Vehículo inspeccionado"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex justify-center text-3xl font-bold mt-4">
                    <span className="border-4 border-black px-2 py-3 rounded-lg">
                      {data?.placa}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Características del Vehículo - Ocupa 4 columnas */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Características del Vehículo
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{data.modelo}</div>
                    <div className="text-xs text-gray-500 font-medium">Año</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-green-600 mb-1">{data.cilindraje}</div>
                    <div className="text-xs text-gray-500 font-medium">CC</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="text-lg font-bold text-purple-600 mb-1">{data.color}</div>
                    <div className="text-xs text-gray-500 font-medium">Color</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-sm font-bold text-gray-700 mb-1">{data.carroceria}</div>
                    <div className="text-xs text-gray-500 font-medium">Carrocería</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-sm font-bold text-gray-700 mb-1">{data.servicio}</div>
                    <div className="text-xs text-gray-500 font-medium">Servicio</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-sm font-bold text-gray-700 mb-1">{data.combustible || "N/A"}</div>
                    <div className="text-xs text-gray-500 font-medium">Combustible</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluaciones Específicas - Ocupa 4 columnas */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl p-6 border border-blue-200 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Evaluaciones Específicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {inspectionResults
                    .filter(result => ["Tapicería", "Llantas", "Pintura", "Fluidos"].includes(result.categoria))
                    .map((result, index) => {
                      const correctStatus = getCorrectStatus(result)
                      const statusInfo = getStatusInfo(correctStatus)
                      const StatusIcon = statusInfo.icon
                      const actualScore = getActualScore(result)
                      const scoreLabel = getScoreLabel(result)

                      return (
                        <div key={index} className={`bg-white rounded-xl p-4 shadow-sm border-2 ${statusInfo.color} transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="p-1 bg-white/80 rounded-lg">
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900">{result.categoria}</h4>
                          </div>

                          <div className="text-center">
                            <div className="text-xl font-bold mb-1 text-gray-900">{actualScore}%</div>
                            {scoreLabel && (
                              <div className="text-xs text-blue-600 font-medium">{scoreLabel}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Información Técnica - Ocupa 6 columnas */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  Información Técnica
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">VIN</div>
                    <div className="font-mono text-sm font-semibold text-gray-900 break-all">{data.vin}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Motor</div>
                    <div className="font-mono text-sm font-semibold text-gray-900">{data.motor}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Chasis</div>
                    <div className="font-mono text-sm font-semibold text-gray-900 break-all">{data.chasis}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Código Fasecolda</div>
                    <div className="font-mono text-sm font-semibold text-gray-900">{data.cod_fasecolda}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de la Inspección - Ocupa 3 columnas */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Detalles de la Inspección
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Sede</div>
                    <div className="font-semibold text-sm text-gray-900">{appointment?.sede?.name || "N/A"}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Modalidad</div>
                    <div className="font-semibold text-sm text-gray-900">{appointment?.inspectionModality?.name || "N/A"}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Estado Orden</div>
                    <div className="font-semibold text-sm text-gray-900">{data.InspectionOrderStatus?.name || "N/A"}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-2">Hora Programada</div>
                    <div className="font-semibold text-sm text-gray-900">{appointment?.scheduled_time || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pruebas Mecanizadas - Ocupa 3 columnas */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Pruebas Mecanizadas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-1">Frenos</div>
                    <div className="font-semibold text-sm text-gray-900">{mechanicalTests.brakes || "N/A"}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-1">Suspensión</div>
                    <div className="font-semibold text-sm text-gray-900">{mechanicalTests.suspension || "N/A"}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-1">Llantas</div>
                    <div className="font-semibold text-sm text-gray-900">{mechanicalTests.tires || "N/A"}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="text-xs text-gray-500 font-medium mb-1">Alineación</div>
                    <div className="font-semibold text-sm text-gray-900">{mechanicalTests.alignment || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accesorios */}
            <div className="lg:col-span-12">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                  Accesorios
                </h3>
                <div className="">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th>Descripción</th>
                        <th>Marca</th>
                        <th>Referencia</th>
                        <th>Cantidad</th>
                        <th>Valor</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointment?.accessories.map((accessory) => (
                        <tr key={accessory.id} className="border-b border-gray-300">
                          <td className="border px-2 py-1">{accessory.description}</td>
                          <td className="border px-2 py-1">{accessory.brand}</td>
                          <td className="border px-2 py-1">{accessory.reference}</td>
                          <td className="border px-2 py-1 text-right">{accessory.quantity}</td>
                          <td className="border px-2 py-1 text-right">{accessory.value}</td>
                          <td className="border px-2 py-1">{accessory.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


          </div>
        </div>



        {/* Images Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Fotografías de Inspección</h2>
            <span className="text-sm text-gray-500 font-mono">
              Click en la imagen para ver detalles
            </span>
          </div>

          {appointment?.images ? (
            <div className="space-y-6">
              {/* Imágenes principales */}
              {appointment.images.main_images && appointment.images.main_images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Fotografías Principales</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {appointment.images.main_images.length} imágenes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {appointment.images.main_images.map((image, index) => (
                      <div
                        key={index}
                        className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => handleMediaClick(image)}
                      >
                        {/* Contenedor de imagen con aspect ratio */}
                        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                          <img
                            src={image.url}
                            alt={image.description || image.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onLoad={() => console.log('✅ Imagen principal cargada:', image.url)}
                            onError={(e) => {
                              console.error('❌ Error cargando imagen principal:', image.url, e)
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />

                          {/* Estado de error */}
                          <div className="hidden absolute inset-0 bg-gray-100">
                            <div className="flex flex-col items-center justify-center h-full">
                              <Camera className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500">Error al cargar</span>
                            </div>
                          </div>

                          {/* Indicador de hover */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>

                        {/* Información de la imagen */}
                        <div className="p-3">
                          <div className="text-xs font-medium text-gray-900 truncate mb-1">
                            {formatImageLabel(image.slot)}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {image.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imágenes adicionales */}
              {appointment.images.additional_images && appointment.images.additional_images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Fotografías Adicionales</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {appointment.images.additional_images.length} imágenes
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {appointment.images.additional_images.map((image, index) => (
                      <div
                        key={index}
                        className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-300 transform hover:-translate-y-0.5"
                        onClick={() => handleMediaClick(image)}
                      >
                        {/* Contenedor de imagen compacto */}
                        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                          <img
                            src={image.url}
                            alt={image.description || image.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />

                          {/* Estado de error */}
                          <div className="hidden absolute inset-0 bg-gray-100">
                            <div className="flex flex-col items-center justify-center h-full">
                              <Camera className="h-5 w-5 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-500">Error</span>
                            </div>
                          </div>

                          {/* Indicador de hover */}
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-2 h-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>

                        {/* Información compacta */}
                        <div className="p-2">
                          <div className="text-xs text-gray-600 truncate font-medium">
                            {image.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de descarga */}
              {appointment.images.total_count > 0 && allowDownload && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => downloadAllImages(appointment.images)}
                    className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                      <Download className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">Descargar Todas las Imágenes</span>
                      <span className="text-xs text-blue-100">{appointment.images.total_count} archivos</span>
                    </div>
                  </button>

                  {appointment.images.main_images && appointment.images.main_images.length > 0 && (
                    <button
                      onClick={() => downloadAllImages({ main_images: appointment.images.main_images })}
                      className="group flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>Principales ({appointment.images.main_images.length})</span>
                    </button>
                  )}

                  {appointment.images.additional_images && appointment.images.additional_images.length > 0 && (
                    <button
                      onClick={() => downloadAllImages({ additional_images: appointment.images.additional_images })}
                      className="group flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>Adicionales ({appointment.images.additional_images.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Mostrar error si existe */}
              {appointment.images.error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">Error al cargar imágenes</h4>
                      <p className="text-red-700 text-sm leading-relaxed">
                        {appointment.images.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Camera className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay imágenes disponibles</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Las imágenes de esta inspección aún no han sido cargadas o procesadas.
              </p>
            </div>
          )}
        </div>

        {/* Inspection Results */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Resultados de Inspección</h2>

          {/* Regular inspection results for other categories */}
          <div className="space-y-4">
            {inspectionResults
              .filter(result => !["Tapicería", "Llantas", "Pintura", "Fluidos"].includes(result.categoria))
              .map((result, index) => {
                const statusInfo = getStatusInfo(result.estado)
                const StatusIcon = statusInfo.icon
                const actualScore = getActualScore(result)

                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`p-4 ${statusInfo.color} border-b border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5" />
                          <h3 className="font-semibold">{result.categoria}</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          {actualScore !== null && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">{actualScore}%</div>
                              <div className="text-sm">Puntaje</div>
                              {result.puntaje === 0 && actualScore > 0 && (
                                <div className="text-xs text-orange-600">*Calculado</div>
                              )}
                            </div>
                          )}
                          <div className="text-right">
                            <div className="font-medium">{statusInfo.text}</div>
                            <div className="text-sm">Estado</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result.parts && result.parts.length > 0 && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {result.parts.map((part, partIndex) => (
                            <div key={partIndex} className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-900 mb-1">{part.parte}</div>
                              <div className="text-sm text-gray-600">
                                {getOptionLabel(part.opciones, part.responseValue)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>

        {/* Observations */}
        {appointment?.observaciones && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Observaciones</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">{appointment.observaciones}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center text-sm text-gray-500">
            <p>Este reporte fue generado automáticamente el {new Date().toLocaleString()}</p>
            <p className="mt-2">
              Inspección N° {data.numero} - Placa: {data.placa}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa de Imágenes */}
      {showPreviewModal && previewMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-2">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Botón de cerrar */}
            <button
              onClick={closePreviewModal}
              className="absolute top-2 right-2 z-10 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Controles de navegación */}
            {(() => {
              const allImages = [...(appointment?.images?.main_images || []), ...(appointment?.images?.additional_images || [])]
              return allImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </>
              )
            })()}

            {/* Imagen */}
            <div className="w-full max-w-4xl max-h-[90vh] mx-2">
              <img
                src={previewMedia.url}
                alt={previewMedia.description || 'Vista previa'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTcyOSA4Ny41NzI5IDgyIDk4IDgyQzEwOC40MjcgODIgMTE2IDg5LjU3MjkgMTE2IDEwMEMxMTYgMTEwLjQyNyAxMDguNDI3IDExOCA5OCAxMThDOC41NzI5IDExOCAwIDExMC40MjcgMCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNjAgMTQwSDBWMTIwQzAgMTEwLjQyNyA3LjU3Mjg5IDEwMiAxOCAxMDJIMTgyQzE5Mi40MjcgMTAyIDIwMCAxMTAuNDI3IDIwMCAxMjBWMTQwWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K'
                }}
              />

              {/* Información de la imagen */}
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{previewMedia.description || 'Imagen'}</p>
                    <p className="text-xs text-gray-300">
                      {formatImageDate(previewMedia.created_at)}
                    </p>
                  </div>
                  {
                    allowDownload && <button
                      onClick={() => downloadMedia(previewMedia)}
                      className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 ml-2"
                      title="Descargar"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  }
                </div>
              </div>
            </div>

            {/* Contador de imágenes */}
            {(() => {
              const allImages = [...(appointment?.images?.main_images || []), ...(appointment?.images?.additional_images || [])]
              return allImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} de {allImages.length}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default InspectionReport
