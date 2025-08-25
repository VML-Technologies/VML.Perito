import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageCircle, Plus, X } from 'lucide-react';
import CommentEditor from './CommentEditor';
import CommentList from './CommentList';
import { useComments } from '../hooks/use-comments';

const CommentSection = ({ orderId }) => {
    const [showEditor, setShowEditor] = useState(false);
    const { comments, createComment } = useComments(orderId);

    const handleCommentCreated = (newComment) => {
        // El hook ya actualiza automáticamente la lista
        setShowEditor(false);
    };

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MessageCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900">
                                    Sistema de Comentarios
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Comunicación y seguimiento de la orden
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                                {comments.length} comentarios
                            </Badge>
                            
                            <Button
                                onClick={() => setShowEditor(!showEditor)}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                {showEditor ? (
                                    <>
                                        <X className="h-4 w-4" />
                                        Cancelar
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Nuevo Comentario
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editor de comentarios (condicional) */}
            {showEditor && (
                <CommentEditor 
                    orderId={orderId} 
                    onCommentCreated={handleCommentCreated}
                    createComment={createComment}
                />
            )}

            {/* Lista de comentarios */}
            <CommentList orderId={orderId} />
        </div>
    );
};

export default CommentSection;

