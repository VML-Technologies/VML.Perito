import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, CheckCircle, AlertTriangle, ArrowLeft, User, Car, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';
import logo_mundial from '@/assets/logo_mundial.svg';
import { useInspectionQueueWebSocket } from '@/hooks/use-inspection-queue-websocket';
import { testScenarios, calculateTimeUntilAppointment } from '@/utils/appointmentTimeTest';

const InspeccionEspera = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        navigate(`/inspeccion/${hash}`);
    }, [hash]);
   
    return <></>;
};

export default InspeccionEspera;
