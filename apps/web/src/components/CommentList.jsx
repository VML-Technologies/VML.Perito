import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import CommentItem from './CommentItem';
import { useComments } from '../hooks/use-comments';

const CommentList = ({ orderId }) => {
    const { 
        comments, 
        loading, 
        error, 
        pagination, 
        fetchComments 
    } = useComments(orderId);

    const handleRefresh = () => {
        fetchComments(1);
    };

    const handleLoadMore = () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchComments(pagination.currentPage + 1);
        }
    };

    if (loading && comments.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto mb-4" />
                        <p className="text-gray-500">Cargando comentarios...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Comentarios
                        {comments.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {pagination.totalComments}
                            </Badge>
                        )}
                    </CardTitle>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-1"
                    >
                        {loading ? (
                            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-600" />
                        ) : (
                            <RefreshCw className="h-3 w-3" />
                        )}
                        Actualizar
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No hay comentarios</p>
                        <p className="text-sm">Sé el primero en añadir un comentario a esta orden</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}
                        
                        {pagination.currentPage < pagination.totalPages && (
                            <div className="text-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                    ) : (
                                        'Cargar más comentarios'
                                    )}
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Página {pagination.currentPage} de {pagination.totalPages}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CommentList;
