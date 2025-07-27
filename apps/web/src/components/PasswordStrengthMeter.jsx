import React from 'react';
import { Progress } from '@/components/ui/progress';

const PasswordStrengthMeter = ({ password }) => {
    const calculateStrength = (password) => {
        if (!password) return 0;
        
        let score = 0;
        
        // Longitud
        if (password.length >= 8) score += 10;
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;
        
        // Complejidad
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
        
        // Variedad de caracteres
        const uniqueChars = new Set(password).size;
        if (uniqueChars >= 8) score += 10;
        if (uniqueChars >= 12) score += 10;
        
        // Bonus por longitud extra
        if (password.length > 20) score += 10;
        
        return Math.min(score, 100);
    };

    const getStrengthInfo = (strength) => {
        if (strength < 30) return { level: 'Muy Débil', color: 'bg-red-500', textColor: 'text-red-600' };
        if (strength < 50) return { level: 'Débil', color: 'bg-orange-500', textColor: 'text-orange-600' };
        if (strength < 70) return { level: 'Moderada', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
        if (strength < 90) return { level: 'Fuerte', color: 'bg-green-500', textColor: 'text-green-600' };
        return { level: 'Muy Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
    };

    const strength = calculateStrength(password);
    const strengthInfo = getStrengthInfo(strength);

    if (!password) return null;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fortaleza de la contraseña:</span>
                <span className={`text-sm font-semibold ${strengthInfo.textColor}`}>
                    {strengthInfo.level}
                </span>
            </div>
            <Progress value={strength} className="h-2" />
            <div className="text-xs text-muted-foreground">
                {strength < 30 && "La contraseña es muy débil. Añade más caracteres y variedad."}
                {strength >= 30 && strength < 50 && "La contraseña es débil. Añade mayúsculas, números o caracteres especiales."}
                {strength >= 50 && strength < 70 && "La contraseña es moderada. Añade más caracteres especiales o longitud."}
                {strength >= 70 && strength < 90 && "La contraseña es fuerte. ¡Buen trabajo!"}
                {strength >= 90 && "¡Excelente! La contraseña es muy fuerte."}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter; 