import { AlertCircle, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCalendarConnection,
  useConnectCalendar,
  useDisconnectCalendar,
} from '@/lib/hooks/useCalendar';

export function CalendarIntegration() {
  const { data: connection, isLoading, error } = useCalendarConnection();
  const connectCalendar = useConnectCalendar();
  const disconnectCalendar = useDisconnectCalendar();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Initiate OAuth flow
      // In a real implementation, this would redirect to Google OAuth
      // For now, we'll simulate with a placeholder auth code
      const authCode = 'placeholder-auth-code';
      await connectCalendar.mutateAsync({ authCode });
    } catch (error) {
      console.error('Failed to connect calendar:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectCalendar.mutateAsync();
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-full h-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-24" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = connection?.isConnected ?? false;
  const hasError = error || connectCalendar.error || disconnectCalendar.error;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <CardTitle>Google Calendar Integration</CardTitle>
              </div>
              <CardDescription>
                Sync your bookings with Google Calendar to manage your schedule across platforms
              </CardDescription>
            </div>
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && connection ? (
            <div className="space-y-4">
              <div className="space-y-2 bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Connected Account:</span>
                  <span>{connection.email || 'N/A'}</span>
                </div>
                {connection.lastSyncedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span className="font-medium">Last Synced:</span>
                    <span>{new Date(connection.lastSyncedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={disconnectCalendar.isPending}
                  >
                    {disconnectCalendar.isPending ? 'Disconnecting...' : 'Disconnect Calendar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will stop syncing your bookings with Google Calendar. You can reconnect at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnect}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Connect your Google Calendar to automatically sync your bookings and keep your schedule up to date.
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting || connectCalendar.isPending}
              >
                {isConnecting || connectCalendar.isPending ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {error
                ? 'Failed to load calendar connection status.'
                : connectCalendar.error
                  ? 'Failed to connect calendar. Please try again.'
                  : 'Failed to disconnect calendar. Please try again.'}
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Troubleshooting:</p>
              <ul className="space-y-1 ml-2 list-disc list-inside">
                <li>Check your internet connection</li>
                <li>Make sure you have granted the necessary permissions</li>
                <li>Try refreshing the page and connecting again</li>
                <li>If the problem persists, contact support</li>
              </ul>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
