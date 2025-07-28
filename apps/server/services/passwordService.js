import bcrypt from 'bcryptjs';

class PasswordService {
    // Política de contraseñas robusta
    static PASSWORD_POLICY = {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommonPasswords: true,
        preventSequentialChars: true,
        preventRepeatedChars: true
    };

    // Contraseñas comunes que deben evitarse
    static COMMON_PASSWORDS = [
        'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
        'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
        'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
        'ranger', 'iwantu', 'jennifer', 'hunter', 'joshua', 'maggie',
        'shadow', 'melissa', 'andrea', 'buster', 'jessica', 'danny',
        'oliver', 'charlie', 'andrew', 'michelle', 'jackson', 'tiger',
        'nicole', 'elephant', 'great', 'spider', 'computer', 'contraseña',
        '12345', 'mi contraseña', 'acceso', 'usuario', 'secreto',
        'admin123', 'clave', 'seguridad', 'hola123', 'prueba', 'bienvenido',
        'mexico', 'colombia', 'argentina', 'futbol', 'amor', 'felicidad',
        'estrella', 'angel', 'princesa', 'campeon', 'sol', 'luna', 'maestro',
        'dios', 'familia', 'amigos'
    ];

    // Validar contraseña según la política
    static validatePassword(password) {
        const errors = [];

        // Longitud mínima y máxima
        if (password.length < this.PASSWORD_POLICY.minLength) {
            errors.push(`Tener al menos ${this.PASSWORD_POLICY.minLength} caracteres`);
        }

        if (password.length > this.PASSWORD_POLICY.maxLength) {
            errors.push(`No tener más de ${this.PASSWORD_POLICY.maxLength} caracteres`);
        }

        // Requerir mayúsculas
        if (this.PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Contener al menos una letra mayúscula');
        }

        // Requerir minúsculas
        if (this.PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Contener al menos una letra minúscula');
        }

        // Requerir números
        if (this.PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
            errors.push('Contener al menos un número');
        }

        // Requerir caracteres especiales
        if (this.PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
        }

        // Prevenir contraseñas comunes
        if (this.PASSWORD_POLICY.preventCommonPasswords && this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
            errors.push('Ser menos común');
        }

        // Prevenir caracteres secuenciales (123, abc, etc.)
        if (this.PASSWORD_POLICY.preventSequentialChars) {
            const sequentialPatterns = [
                '123', '234', '345', '456', '567', '678', '789', '890',
                'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
                'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
                'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl', 'klz'
            ];

            const lowerPassword = password.toLowerCase();
            for (const pattern of sequentialPatterns) {
                if (lowerPassword.includes(pattern)) {
                    errors.push('No contener caracteres secuenciales');
                    break;
                }
            }
        }

        // Prevenir caracteres repetidos (aaa, 111, etc.)
        if (this.PASSWORD_POLICY.preventRepeatedChars) {
            for (let i = 0; i < password.length - 2; i++) {
                if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
                    errors.push('No contener el mismo carácter repetido más de 2 veces');
                    break;
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Calcular fortaleza de la contraseña (0-100)
    static calculatePasswordStrength(password) {
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
    }

    // Obtener descripción de la fortaleza
    static getPasswordStrengthDescription(strength) {
        if (strength < 30) return { level: 'Muy Débil', color: 'red' };
        if (strength < 50) return { level: 'Débil', color: 'orange' };
        if (strength < 70) return { level: 'Moderada', color: 'yellow' };
        if (strength < 90) return { level: 'Fuerte', color: 'lightgreen' };
        return { level: 'Muy Fuerte', color: 'green' };
    }

    // Hashear contraseña
    static async hashPassword(password) {
        const saltRounds = 12; // Aumentado para mayor seguridad
        return await bcrypt.hash(password, saltRounds);
    }

    // Verificar contraseña
    static async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Generar contraseña temporal segura
    static generateTemporaryPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        // Asegurar al menos un carácter de cada tipo
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
        password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Especial

        // Completar el resto
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Mezclar los caracteres
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

export default PasswordService; 