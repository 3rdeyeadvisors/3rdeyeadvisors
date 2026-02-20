import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const BroadcastAlertsLog = () => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['broadcast-alerts', filter],
    queryFn: async () => {
      let query = supabase
        .from('broadcast_alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filter === 'unresolved') {
        query = query.eq('resolved', false);
      } else if (filter === 'resolved') {
        query = query.eq('resolved', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const { data: weeklySummaries } = useQuery({
    queryKey: ['weekly-summaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broadcast_weekly_summary')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  const handleRetry = async (alertId: string) => {
    try {
      window.open(`https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/retry-broadcast?alert_id=${alertId}`, '_blank');
      toast.success("Retry initiated : check the new tab for results");
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      toast.error("Failed to initiate retry");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'default';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'webhook_failure':
      case 'queue_failure':
      case 'email_failure':
        return <AlertTriangle className="h-4 w-4" />;
      case 'missing_field':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>3EA Broadcast Alerts</CardTitle>
          <CardDescription>
            Monitor and manage broadcast automation alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unresolved">
                Unresolved ({alerts?.filter(a => !a.resolved).length || 0})
              </TabsTrigger>
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
              ) : alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getAlertTypeIcon(alert.alert_type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.alert_type.replace('_', ' ')}</Badge>
                              {alert.resolved && (
                                <Badge variant="secondary">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            
                            <p className="font-medium">{alert.error_message}</p>
                            
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString('en-US', {
                                timeZone: 'America/Chicago',
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })} CST
                            </p>

                            {alert.missing_fields && alert.missing_fields.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">Missing fields:</span>{' '}
                                {alert.missing_fields.join(', ')}
                              </div>
                            )}

                            {alert.failed_payload && (
                              <details className="text-sm">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  View payload
                                </summary>
                                <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto text-xs">
                                  {JSON.stringify(alert.failed_payload, null, 2)}
                                </pre>
                              </details>
                            )}

                            {alert.retry_count > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Retry attempts: {alert.retry_count}
                              </p>
                            )}
                          </div>
                        </div>

                        {!alert.resolved && (
                          <Button
                            size="sm"
                            onClick={() => handleRetry(alert.id)}
                            variant="outline"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {filter === 'unresolved' 
                    ? '✅ No unresolved alerts : all systems running smoothly!'
                    : 'No alerts found'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {weeklySummaries && weeklySummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary Reports</CardTitle>
            <CardDescription>
              Past 4 weeks of broadcast performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklySummaries.map((summary) => (
                <Card key={summary.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(summary.week_start).toLocaleDateString()} to {new Date(summary.week_end).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{summary.total_broadcasts_sent}/{summary.total_broadcasts_scheduled} broadcasts</span>
                          <span>{summary.total_emails_sent.toLocaleString()} emails</span>
                          <span>{summary.total_subscribers.toLocaleString()} subscribers</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {summary.success_rate}%
                        </p>
                        <p className="text-xs text-muted-foreground">success rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
