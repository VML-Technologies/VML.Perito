"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API_ROUTES } from "@/config/api"

const InspectionReport = () => {
  const { session_id, inspectionOrderId, appointmentId } = useParams()
  const [pdfData, setPdfData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(async () => {
    console.log("#####################################")
    console.log("cargando reporte de inspección...")
    console.log("ID de sesión:", session_id)
    console.log("ID de orden de inspección:", inspectionOrderId)
    console.log("ID de cita:", appointmentId)
    const response = await fetch(API_ROUTES.INSPECTION_ORDERS.PDF(session_id));
    const data = await response.json();
    console.log("data del reporte:", data)
    if (data.success && data.data) {
      setPdfData(data.data)
    } else {
      setError('No se pudo obtener el enlace del PDF')
    }

    console.log("#####################################")
  }, [])

  useEffect(() => {
    const fetchPdfReport = async () => {
      try {
        console.log("#####################################")
        console.log("cargando reporte de inspección...")
        console.log("ID de sesión:", session_id)
        console.log("ID de orden de inspección:", inspectionOrderId)
        console.log("ID de cita:", appointmentId)
        const response = await fetch(API_ROUTES.INSPECTION_ORDERS.PDF(session_id));
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json();
        console.log("data del reporte:", data)

        if (data.success && data.data) {
          setPdfData(data.data)
        } else {
          setError('No se pudo obtener el enlace del PDF')
        }

        console.log("#####################################")
      } catch (err) {
        console.error('Error fetching PDF report:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session_id && inspectionOrderId && appointmentId) {
      fetchPdfReport()
    }
  }, [session_id, inspectionOrderId, appointmentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte de inspección...</p>
        </div>
      </div>
    )
  }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="text-red-500 text-xl mb-4">⚠️</div>
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el reporte</h2>
  //         <p className="text-gray-600">{error}</p>
  //       </div>
  //     </div>
  //   )
  // }

  if (!pdfData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No se encontró el reporte</h2>
          <p className="text-gray-600">No hay datos disponibles para mostrar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 border border-red-500">
      aca
      <pre>{JSON.stringify(pdfData, null, 2)}</pre>
      {/* Header with PDF info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reporte de Inspección
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Placa: <span className="font-medium">{pdfData.plate}</span> |
                  Orden: <span className="font-medium">{pdfData.inspectionOrderId}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={pdfData.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={pdfData.downloadUrl}
            className="w-full h-screen border-0"
            title={`Reporte de Inspección - ${pdfData.fileName}`}
          />
        </div>
      </div>

      {/* Footer with expiration info */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <p className="text-sm text-gray-500 text-center">
              Este enlace expira en {pdfData.expiresIn} minutos |
              Archivo: {pdfData.fileName}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InspectionReport
