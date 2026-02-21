import { useOfflineData } from '@/hooks/useOfflineData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  CloudOff, 
  Cloud, 
  Download, 
  Trash2, 
  RefreshCw,
  HardDrive,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const {
    isOnline,
    lastSync,
    cachedPages,
    storageUsed,
    storageQuota,
    storagePercentage,
    isSyncing,
    syncForOffline,
    clearCache
  } = useOfflineData();

  const handleSync = async () => {
    toast.loading('Syncing content for offline use...', { id: 'sync' });
    await syncForOffline();
    toast.success(`Synced! ${cachedPages.length + 9} pages available offline.`, { id: 'sync' });
  };

  const handleClearCache = async () => {
    toast.loading('Clearing cache...', { id: 'clear' });
    await clearCache();
    toast.success('Cache cleared successfully.', { id: 'clear' });
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-2 text-xs",
            !isOnline && "text-amber-400"
          )}
        >
          {isOnline ? (
            <Cloud className="w-4 h-4 text-green-400" />
          ) : (
            <CloudOff className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Cloud className="w-5 h-5 text-green-400" />
              ) : (
                <CloudOff className="w-5 h-5 text-amber-400" />
              )}
              <span className="font-medium">
                {isOnline ? 'Connected' : 'Offline Mode'}
              </span>
            </div>
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Last Sync */}
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Clock className="w-4 h-4" />
            <span>Last synced: {formatLastSync()}</span>
          </div>

          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-white/50" />
                <span>Storage Used</span>
              </div>
              <span className="text-white/50">
                {storageUsed} / {storageQuota}
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
          </div>

          {/* Cached Pages */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>{cachedPages.length > 0 ? cachedPages.length : '9+'} pages available offline</span>
            </div>
            {cachedPages.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {cachedPages.slice(0, 10).map((page) => (
                  <Badge key={page} variant="outline" className="text-xs">
                    {page === '/' ? 'Home' : page.slice(1)}
                  </Badge>
                ))}
                {cachedPages.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{cachedPages.length - 10} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/8">
            <Button 
              onClick={handleSync} 
              size="sm" 
              className="flex-1 gap-2"
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button 
              onClick={handleClearCache} 
              size="sm" 
              variant="outline"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>

          {!isOnline && (
            <p className="text-xs text-white/50 text-center">
              Content will sync automatically when you're back online.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Badge for content that's available offline
export const OfflineAvailableBadge = ({ className }: { className?: string }) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 text-xs bg-green-500/10 text-green-400 border-green-500/30",
        className
      )}
    >
      <CloudOff className="w-3 h-3" />
      Offline
    </Badge>
  );
};
