// Script de prueba para verificar la configuración de email
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Configurar dotenv
dotenv.config()

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Función para reemplazar variables en la plantilla
function replaceTemplateVariables(template, variables) {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, value)
    }
    return result
}

async function testEmailConfiguration() {
    console.log('🧪 Probando configuración de email...\n')

    // Verificar variables de entorno
    const requiredVars = [
        'EMAIL_HOST',
        'EMAIL_USER',
        'EMAIL_PASS',
        'EMAIL_FROM',
        'EMAIL_FROM_NAME'
    ]

    console.log('📋 Verificando variables de entorno:')
    let missingVars = []

    for (const varName of requiredVars) {
        const value = process.env[varName]
        if (value) {
            console.log(`✅ ${varName}: ${varName.includes('PASS') ? '***configurado***' : value}`)
        } else {
            console.log(`❌ ${varName}: NO CONFIGURADO`)
            missingVars.push(varName)
        }
    }

    if (missingVars.length > 0) {
        console.log('\n❌ Faltan variables de entorno requeridas:')
        missingVars.forEach(varName => console.log(`   - ${varName}`))
        console.log('\n📖 Consulta EMAIL_SETUP.md para configurar las variables')
        return false
    }

    console.log('\n🔧 Configurando transporter de nodemailer...')

    // Crear transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    try {
        // Verificar conexión
        console.log('🔍 Verificando conexión SMTP...')
        await transporter.verify()
        console.log('✅ Conexión SMTP exitosa!')

        // Leer la plantilla HTML
        console.log('\n📄 Cargando plantilla HTML...')
        const templatePath = path.join(__dirname, 'email-template.html')
        const emailTemplate = fs.readFileSync(templatePath, 'utf8')
        console.log('✅ Plantilla HTML cargada exitosamente')

        // Verificar que la imagen existe
        console.log('🖼️ Verificando imagen de mesa de ayuda...')
        const imagePath = path.join(__dirname, 'image.png')
        if (!fs.existsSync(imagePath)) {
            throw new Error('No se encontró la imagen image.png en el directorio raíz')
        }
        console.log('✅ Imagen de mesa de ayuda encontrada')

        // Variables de prueba para la plantilla
        const testVariables = {
            user_name: 'Usuario de Prueba',
            PASSWORD_TEMPORAL: 'Test123!',
            login_url: 'https://movilidadmundial.vmltechnologies.com/',
            current_year: new Date().getFullYear()
        }

        // Generar contenido HTML con la plantilla
        console.log('🔧 Generando contenido HTML...')
        const htmlContent = replaceTemplateVariables(emailTemplate, testVariables)
        console.log('✅ Contenido HTML generado')

        // Enviar email de prueba
        console.log('\n📧 Enviando email de prueba con plantilla a:')
        console.log(process.env.EMIAL_TEST)

        const testEmail = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMIAL_TEST, // Enviar a ti mismo como prueba
            subject: '🧪 Prueba de configuración - VML.Perito (Plantilla HTML)',
            html: htmlContent,
            attachments: [
                {
                    filename: 'mesa-ayuda.png',
                    path: path.join(__dirname, 'image.png'),
                    cid: 'mesa-ayuda' // ID para referenciar en el HTML
                }
            ]
        }

        const info = await transporter.sendMail(testEmail)
        console.log('✅ Email de prueba enviado exitosamente!')
        console.log(`📧 Message ID: ${info.messageId}`)
        console.log(`📧 Respuesta: ${info.response}`)

        console.log('\n🎉 ¡Configuración de email verificada!')
        console.log('📋 Email enviado con la plantilla HTML real')
        console.log('📧 Revisa tu bandeja de entrada para ver el resultado')
        return true

    } catch (error) {
        console.error('\n❌ Error en la configuración de email:')
        console.error(`   ${error.message}`)

        if (error.code === 'EAUTH') {
            console.log('\n💡 Sugerencias para error de autenticación:')
            console.log('   - Verifica que EMAIL_USER y EMAIL_PASS sean correctos')
            console.log('   - Para Gmail, usa una contraseña de aplicación')
            console.log('   - Asegúrate de que la verificación en dos pasos esté activada')
        } else if (error.code === 'ECONNECTION') {
            console.log('\n💡 Sugerencias para error de conexión:')
            console.log('   - Verifica que EMAIL_HOST y EMAIL_PORT sean correctos')
            console.log('   - Asegúrate de que tu firewall no bloquee la conexión')
            console.log('   - Verifica que el servidor SMTP esté disponible')
        } else if (error.code === 'ENOENT') {
            console.log('\n💡 Error: No se encontró la plantilla HTML')
            console.log('   - Verifica que email-template.html esté en el directorio raíz')
        }

        return false
    } finally {
        transporter.close()
    }
}

// Ejecutar prueba
testEmailConfiguration()
    .then(success => {
        if (success) {
            console.log('\n🚀 Puedes ejecutar ahora: node sendEmailComertialUsers.js')
        } else {
            console.log('\n⚠️ Corrige los errores antes de ejecutar el script principal')
            process.exit(1)
        }
    })
    .catch(error => {
        console.error('❌ Error inesperado:', error)
        process.exit(1)
    })
