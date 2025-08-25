import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageCircle, User, Clock } from 'lucide-react';

const CommentItem = ({ comment }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getUserDisplayName = (user) => {
        if (!user) return 'Usuario desconocido';
        return user.name || user.email || 'Usuario';
    };

    return (
        <Card className="mb-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="px-4">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(getUserDisplayName(comment.user))}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-2 mb-2">
                                <div className="flex items-center text-sm font-medium text-gray-900">
                                    <User className="h-3 w-3" />
                                    {getUserDisplayName(comment.user)}
                                </div>

                                <Badge variant="secondary" className="text-xs -mt-2">
                                    {comment.user?.roles?.[0]?.name || 'Usuario'}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                <Clock className="h-3 w-3" />
                                {formatDate(comment.created_at)}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex items-start gap-2">
                                <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {comment.comentarios}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CommentItem;

