#!/bin/bash

# Script de startup para Azure Web App
echo "🚀 Iniciando VML.MovilidadMundial en Azure..."

# Navegar al directorio de la aplicación
cd /home/site/wwwroot

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --production --no-optional
    echo "✅ Dependencias instaladas"
else
    echo "📦 Dependencias ya instaladas"
fi

# Verificar que las dependencias críticas estén instaladas
if [ ! -d "node_modules/dotenv" ]; then
    echo "⚠️ dotenv no encontrado, reinstalando dependencias..."
    rm -rf node_modules package-lock.json
    npm install --production --no-optional
fi

# Verificar que la aplicación se pueda iniciar
echo "🔍 Verificando configuración..."
node -e "require('dotenv').config(); console.log('✅ dotenv cargado correctamente')"

# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
npm start 