// load dotenv
import dotenv from 'dotenv'
import User from './apps/server/models/user.js'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Op } from 'sequelize'

// Configurar dotenv
dotenv.config()

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Leer la plantilla HTML
const templatePath = path.join(__dirname, 'email-template.html')
const emailTemplate = fs.readFileSync(templatePath, 'utf8')

// Verificar que la imagen existe
const imagePath = path.join(__dirname, 'image.png')
if (!fs.existsSync(imagePath)) {
    console.error('❌ Error: No se encontró la imagen image.png en el directorio raíz')
    process.exit(1);
}

// Función para reemplazar variables en la plantilla
function replaceTemplateVariables(template, variables) {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, value)
    }
    return result
}

// Función para enviar email
async function sendEmail(to, subject, htmlContent, attachments = []) {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Movilidad Mundial'}" <${process.env.EMAIL_FROM}>`,
            to: to,
            subject: subject,
            html: htmlContent,
            attachments: attachments
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`✅ Email enviado exitosamente a ${to}: ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error(`❌ Error enviando email a ${to}:`, error.message)
        return { success: false, error: error.message }
    }
}

// Función principal
async function sendEmailsToCommercialUsers() {
    try {
        console.log('🚀 Iniciando envío de emails a usuarios comerciales...')

        // Verificar configuración de email
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ Configuración de email incompleta. Verifica las variables de entorno:')
            console.error('   EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_FROM_NAME')
            return
        }

        // Obtener usuarios con la contraseña específica
        /*
where emails in:

select * from users where email in (
    'hosorio@segurosmundial.com.co',
    'setorres@segurosmundial.com.co',
    'gaalvarez@segurosmundial.com.co',
    'stramirez@segurosmundial.com.co',
    'lfvasquez@segurosmundial.com.co',
    'luisaza@segurosmundial.com.co',
    'margomez@segurosmundial.com.co'
)

        */
        const usuarios = await User.findAll({
            where: {
                password: {
                    [Op.in]: [
                        '$2b$10$1gIdZ1oSot0gMGCYMM4oSeLrXkPzuMq1ceT0fJwgeRzraRAXYQrHC'
                    ]
                }
            }
        })

        console.log(`📧 Encontrados ${usuarios.length} usuarios para enviar email`)

        if (usuarios.length === 0) {
            console.log('ℹ️ No se encontraron usuarios con la contraseña especificada')
            return
        }

        // Contadores para estadísticas
        let sentCount = 0
        let failedCount = 0

        // Enviar email a cada usuario
        for (const usuario of usuarios) {
            const email = usuario.email
            const name = usuario.name
            const password = usuario.password
            const login_url = `https://movilidadmundial.vmltechnologies.com/`
            const current_year = new Date().getFullYear()

            console.log(`📧 Procesando usuario: ${name} (${email})`)

            // Variables para la plantilla
            const templateVariables = {
                user_name: name,
                email: email,
                PASSWORD_TEMPORAL: 'ComercialMundial#132', // Aquí deberías obtener la contraseña real
                login_url: login_url,
                current_year: current_year
            }

            // Generar contenido HTML
            const htmlContent = replaceTemplateVariables(emailTemplate, templateVariables)

            // Enviar email
            const result = await sendEmail(
                email,
                '¡Bienvenido a Movilidad Mundial! Activa tu cuenta',
                htmlContent,
                [
                    {
                        filename: 'mesa-ayuda.png',
                        path: path.join(__dirname, 'image.png'),
                        cid: 'mesa-ayuda' // ID para referenciar en el HTML
                    }
                ]
            )

            if (result.success) {
                sentCount++
            } else {
                failedCount++
            }

            // Pequeña pausa entre envíos para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Mostrar estadísticas finales
        console.log('\n📊 Estadísticas de envío:')
        console.log(`✅ Emails enviados exitosamente: ${sentCount}`)
        console.log(`❌ Emails fallidos: ${failedCount}`)
        console.log(`📧 Total procesados: ${usuarios.length}`)

        if (failedCount > 0) {
            console.log('\n⚠️ Algunos emails fallaron. Verifica la configuración de SMTP y las direcciones de email.')
        } else {
            console.log('\n🎉 ¡Todos los emails fueron enviados exitosamente!')
        }

    } catch (error) {
        console.error('❌ Error en el proceso de envío:', error)
    } finally {
        // Cerrar la conexión del transporter
        transporter.close()
        console.log('🔒 Conexión de email cerrada')
    }
}

// Ejecutar la función principal
sendEmailsToCommercialUsers()
