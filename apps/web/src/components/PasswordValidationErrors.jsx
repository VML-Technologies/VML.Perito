import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PasswordValidationErrors = ({ errors }) => {
    if (!errors || errors.length == 0) {
        return null;
    }

    return (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm font-medium text-red-700">
                    Tu contraseña debe:
                </div>
            </div>
            <ul className="space-y-1 text-xs font-mono">
                {errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-1 text-sm text-red-600">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{error}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordValidationErrors; 