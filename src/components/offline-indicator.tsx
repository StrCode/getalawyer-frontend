import { 
  WifiOffIcon, 
  WifiIcon, 
  CloudSyncIcon,
  AlertTriangleIcon,
  CheckmarkCircle02Icon,
  RefreshIcon,
  ClockIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from "date-fns";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

/**
 * Network status indicator component
 */
export function NetworkStatusIndicator({ 
  className,
  showDetails = false 
}: { 
  className?: string;
  showDetails?: boolean;
}) {
  const {
    isOnline,
    isOffline,
    connectionType,
    effectiveType,
    downlink,
    rtt,
    lastOnlineTime,
    lastOfflineTime,
    offlineDuration,
    hasSlowConnection,
    shouldSaveData
  } = useNetworkStatus();

  const getConnectionQuality = () => {
    if (isOffline) return 'offline';
    if (hasSlowConnection) return 'slow';
    if (effectiveType === '4g' || (downlink && downlink > 10)) return 'fast';
    return 'moderate';
  };

  const getStatusColor = () => {
    const quality = getConnectionQuality();
    switch (quality) {
      case 'offline':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'slow':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'moderate':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'fast':
        return 'text-green-500 bg-green-50 border-green-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    if (isOffline) return WifiOffIcon;
    return WifiIcon;
  };

  const getStatusText = () => {
    if (isOffline) {
      if (offlineDuration > 0) {
        return `Offline for ${Math.round(offlineDuration / 1000)}s`;
      }
      return 'Offline';
    }
    
    if (hasSlowConnection) {
      return `Slow connection (${effectiveType})`;
    }
    
    if (shouldSaveData) {
      return 'Data saver mode';
    }
    
    return `Online${effectiveType ? ` (${effectiveType})` : ''}`;
  };

  const getDetailedInfo = () => {
    const info = [];
    
    if (connectionType) info.push(`Type: ${connectionType}`);
    if (effectiveType) info.push(`Speed: ${effectiveType}`);
    if (downlink) info.push(`Downlink: ${downlink} Mbps`);
    if (rtt) info.push(`Latency: ${rtt}ms`);
    
    if (lastOnlineTime && isOnline) {
      info.push(`Online since: ${formatDistanceToNow(lastOnlineTime, { addSuffix: true })}`);
    }
    
    if (lastOfflineTime && isOffline) {
      info.push(`Offline since: ${formatDistanceToNow(lastOfflineTime, { addSuffix: true })}`);
    }
    
    return info;
  };

  if (!showDetails && isOnline && !hasSlowConnection) {
    return null; // Don't show when connection is good
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm",
          getStatusColor(),
          className
        )}>
          <HugeiconsIcon icon={getStatusIcon()} size={14} />
          <span className="font-medium">{getStatusText()}</span>
        </div>
      </TooltipTrigger>
      
      {showDetails && (
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            {getDetailedInfo().map((info, index) => (
              <div key={index} className="text-xs">{info}</div>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

/**
 * Offline queue status indicator
 */
export function OfflineQueueIndicator({ 
  className,
  showDetails = false 
}: { 
  className?: string;
  showDetails?: boolean;
}) {
  const {
    status,
    hasOperations,
    hasPendingOperations,
    hasFailedOperations,
    isProcessing,
    getPendingOperations,
    getFailedOperations,
    processQueue,
    retryFailed,
    clearFailed
  } = useOfflineQueue();

  if (!hasOperations) {
    return null; // Don't show when no operations
  }

  const getStatusColor = () => {
    if (hasFailedOperations) return 'text-red-500 bg-red-50 border-red-200';
    if (isProcessing) return 'text-blue-500 bg-blue-50 border-blue-200';
    if (hasPendingOperations) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-green-500 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (hasFailedOperations) return AlertTriangleIcon;
    if (isProcessing) return CloudSyncIcon;
    if (hasPendingOperations) return ClockIcon;
    return CheckmarkCircle02Icon;
  };

  const getStatusText = () => {
    if (isProcessing) return 'Syncing...';
    if (hasFailedOperations) return `${status.failedOperations} failed`;
    if (hasPendingOperations) return `${status.pendingOperations} pending`;
    return 'All synced';
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm",
      getStatusColor(),
      className
    )}>
      <HugeiconsIcon 
        icon={getStatusIcon()} 
        size={14} 
        className={isProcessing ? 'animate-spin' : ''} 
      />
      <span className="font-medium">{getStatusText()}</span>
      
      {status.totalOperations > 0 && (
        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
          {status.totalOperations}
        </Badge>
      )}
      
      {showDetails && hasFailedOperations && (
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={retryFailed}
            className="h-6 px-2 text-xs"
          >
            <HugeiconsIcon icon={RefreshIcon} size={12} className="mr-1" />
            Retry
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFailed}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Combined offline status bar
 */
export function OfflineStatusBar({ 
  className,
  showNetworkDetails = true,
  showQueueDetails = true 
}: { 
  className?: string;
  showNetworkDetails?: boolean;
  showQueueDetails?: boolean;
}) {
  const { isOffline } = useNetworkStatus();
  const { hasOperations } = useOfflineQueue();

  // Only show if offline or has operations
  if (!isOffline && !hasOperations) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-3 bg-gray-50 border-b",
      className
    )}>
      <div className="flex items-center gap-3">
        <NetworkStatusIndicator showDetails={showNetworkDetails} />
        <OfflineQueueIndicator showDetails={showQueueDetails} />
      </div>
      
      {isOffline && (
        <div className="text-xs text-gray-600">
          Changes will sync when connection is restored
        </div>
      )}
    </div>
  );
}

/**
 * Floating offline indicator (for minimal UI)
 */
export function FloatingOfflineIndicator({ 
  className,
  position = 'bottom-right' 
}: { 
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const { isOffline } = useNetworkStatus();
  const { hasPendingOperations, hasFailedOperations, isProcessing } = useOfflineQueue();

  const shouldShow = isOffline || hasPendingOperations || hasFailedOperations || isProcessing;

  if (!shouldShow) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div className={cn(
      "fixed z-50 flex items-center gap-2",
      getPositionClasses(),
      className
    )}>
      <NetworkStatusIndicator />
      <OfflineQueueIndicator />
    </div>
  );
}

/**
 * Offline mode banner (for prominent display)
 */
export function OfflineModeBanner({ 
  className,
  dismissible = false,
  onDismiss 
}: { 
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}) {
  const { isOffline, lastOfflineTime, offlineDuration } = useNetworkStatus();
  const { hasPendingOperations, status } = useOfflineQueue();

  if (!isOffline) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg",
      className
    )}>
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={WifiOffIcon} size={20} className="text-amber-600" />
        
        <div>
          <div className="font-medium text-amber-800">
            Working offline
          </div>
          <div className="text-sm text-amber-700">
            {lastOfflineTime && (
              <>Offline since {formatDistanceToNow(lastOfflineTime, { addSuffix: true })}. </>
            )}
            {hasPendingOperations && (
              <>{status.pendingOperations} changes will sync when connection is restored.</>
            )}
          </div>
        </div>
      </div>
      
      {dismissible && onDismiss && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-800"
        >
          ×
        </Button>
      )}
    </div>
  );
}