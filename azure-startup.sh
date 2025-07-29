#!/bin/bash

# Script de startup para Azure Web App
echo "🚀 Iniciando VML.MovilidadMundial en Azure..."

# Navegar al directorio de la aplicación
cd /home/site/wwwroot

# Instalar dependencias del servidor (siempre actualizar)
echo "📦 Instalando dependencias del servidor..."
cd apps/server
npm install --production --no-optional
cd ..
echo "✅ Dependencias del servidor instaladas"



# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
cd apps/server
npm start 