'use client';

import { useState, useEffect, JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PdfExport {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadToken: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

type BadgeVariant = 'secondary' | 'outline' | 'default' | 'destructive' | null | undefined;

export function PdfExportDashboard() {
  const [exports, setExports] = useState<PdfExport[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchExports = async () => {
    try {
      const response = await fetch('/api/export');
      const data = await response.json();
      setExports(data.exports);
    } catch (error) {
      console.error('Error fetching exports:', error);
    }
  };

  const triggerExport = async () => {
    setIsTriggering(true);
    try {
      const response = await fetch('/api/trigger', {
        method: 'POST',
      });

      if (response.ok) {
        fetchExports();
      } else {
        throw new Error('Failed to trigger export');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    fetchExports();
    const interval = setInterval(fetchExports, 2000);
    return () => clearInterval(interval);
  }, []);

  const statusIcons: { [key: string]: JSX.Element } = {
    pending: <Clock className='h-4 w-4' />,
    processing: <Loader2 className='h-4 w-4 animate-spin' />,
    completed: <CheckCircle className='h-4 w-4' />,
    failed: <XCircle className='h-4 w-4' />,
  };

  const statusColors: { [key: string]: string } = {
    pending: 'secondary',
    processing: 'outline',
    completed: 'default',
    failed: 'destructive',
  };

  const getStatusIcon = (status: string) => {
    return statusIcons[status] || <FileText className='h-4 w-4' />;
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || 'secondary';
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const seconds = Math.floor(diff / 1000);
    return `${seconds}s remaining`;
  };

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>PDF Export Dashboard</h1>
          <p className='text-muted-foreground'>
            Generate and download PDF exports with temporary links
          </p>
        </div>
        <Button onClick={triggerExport} disabled={isTriggering} size='lg'>
          {isTriggering ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Starting Export...
            </>
          ) : (
            <>
              <FileText className='mr-2 h-4 w-4' />
              Start New Export
            </>
          )}
        </Button>
      </div>

      <div className='grid gap-4'>
        {exports?.length === 0 ? (
          <Card>
            <CardContent className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                <h3 className='mb-2 text-lg font-semibold'>No exports yet</h3>
                <p className='text-muted-foreground'>
                  Click &quot;Start New Export&quot; to create your first PDF export
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          exports?.map((exportItem) => (
            <Card key={exportItem.id}>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    {getStatusIcon(exportItem.status)}
                    <CardTitle className='text-lg'>Export #{exportItem.id}</CardTitle>
                    <Badge variant={getStatusColor(exportItem.status) as BadgeVariant}>
                      {exportItem.status}
                    </Badge>
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {new Date(exportItem.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    {exportItem.status === 'completed' && exportItem.downloadToken && (
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm font-medium'>Download:</span>
                        {isExpired(exportItem.expiresAt) ? (
                          <Badge variant='destructive'>Link Expired</Badge>
                        ) : (
                          <div className='flex items-center space-x-2'>
                            <Badge variant='outline'>
                              {getTimeRemaining(exportItem.expiresAt)}
                            </Badge>
                            <Button size='sm' asChild>
                              <a href={`/api/download/${exportItem.downloadToken}`} download>
                                <Download className='mr-2 h-4 w-4' />
                                Download PDF
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {exportItem.status === 'processing' && (
                      <p className='text-muted-foreground text-sm'>Processing your PDF export...</p>
                    )}
                    {exportItem.status === 'pending' && (
                      <p className='text-muted-foreground text-sm'>
                        Export queued and waiting to be processed...
                      </p>
                    )}
                    {exportItem.status === 'failed' && (
                      <p className='text-destructive text-sm'>Export failed. Please try again.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
