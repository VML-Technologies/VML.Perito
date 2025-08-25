import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';
import { useNotificationContext } from '../contexts/notification-context';

const CommentEditor = ({ orderId, onCommentCreated, createComment }) => {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useNotificationContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!commentText.trim()) {
            setError('El comentario no puede estar vacío');
            return;
        }

        if (commentText.length > 1000) {
            setError('El comentario no puede exceder 1000 caracteres');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const newComment = await createComment(commentText.trim());
            
            if (newComment) {
                setCommentText('');
                setError('');
                
                showToast('El comentario se ha añadido exitosamente', 'success');

                if (onCommentCreated) {
                    onCommentCreated(newComment);
                }
            }
        } catch (error) {
            console.error('Error creando comentario:', error);
            setError(error.message || 'Error de conexión. Intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTextChange = (e) => {
        setCommentText(e.target.value);
        setError(''); // Limpiar errores al escribir
    };

    const remainingChars = 1000 - commentText.length;
    const isNearLimit = remainingChars <= 100;
    const isOverLimit = remainingChars < 0;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Añadir Comentario
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-sm font-medium">
                            Comentario *
                        </Label>
                        <Textarea
                            id="comment"
                            value={commentText}
                            onChange={handleTextChange}
                            placeholder="Escribe tu comentario aquí..."
                            className={`min-h-[120px] resize-none ${
                                isOverLimit ? 'border-red-300 bg-red-50' : 
                                isNearLimit ? 'border-yellow-300 bg-yellow-50' : ''
                            }`}
                            disabled={isSubmitting}
                            maxLength={1000}
                        />
                        <div className={`text-xs flex justify-between ${
                            isOverLimit ? 'text-red-600' : 
                            isNearLimit ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                            <span>
                                {isOverLimit ? 'Excediste el límite de caracteres' : 
                                 isNearLimit ? 'Cerca del límite' : 'Comentario válido'}
                            </span>
                            <span>{remainingChars}/1000</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-gray-500">
                            Los comentarios son inmutables una vez creados
                        </div>
                        
                        <Button
                            type="submit"
                            disabled={isSubmitting || !commentText.trim() || isOverLimit}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Crear Comentario
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default CommentEditor;
