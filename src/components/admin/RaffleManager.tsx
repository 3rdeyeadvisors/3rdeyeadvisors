import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Trophy, Users, Gift, CheckCircle2, X, Loader2, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FixTicketMismatchButton } from "./FixTicketMismatchButton";

interface Raffle {
  id: string;
  title: string;
  description: string;
  prize: string;
  prize_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  winner_user_id?: string;
}

interface Participant {
  user_id: string;
  entry_count: number;
  email: string;
  display_name: string;
  tickets?: Array<{
    id: string;
    ticket_source: string;
    earned_at: string;
    metadata: any;
  }>;
}

interface VerificationTask {
  id: string;
  user_id: string;
  task_type: string;
  instagram_username?: string;
  x_username?: string;
  verification_status: string;
  email: string;
  display_name: string;
  created_at: string;
  verified_at?: string;
}

const RaffleManager = () => {
  const { toast } = useToast();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [verificationTasks, setVerificationTasks] = useState<VerificationTask[]>([]);
  const [verifiedTasksHistory, setVerifiedTasksHistory] = useState<VerificationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [refreshingVerifications, setRefreshingVerifications] = useState(false);
  const [refreshingHistory, setRefreshingHistory] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [sendingEndedNotification, setSendingEndedNotification] = useState(false);
  const [sendingWinnerAnnouncement, setSendingWinnerAnnouncement] = useState(false);
  const [repairingTickets, setRepairingTickets] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "Bitcoin",
    prize_amount: "50",
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: false,
  });

  useEffect(() => {
    fetchRaffles();
  }, []);

  useEffect(() => {
    // Auto-fetch verification tasks and participants when there's an active raffle
    const activeRaffle = raffles.find(r => r.is_active);
    if (activeRaffle) {
      fetchVerificationTasks(activeRaffle.id);
      fetchParticipants(activeRaffle.id);
    }
  }, [raffles]);

  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRaffles(data || []);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      toast({
        title: "Error",
        description: "Failed to load raffles",
        variant: "destructive",
      });
    }
  };

  const fetchParticipants = async (raffleId: string) => {
    setLoadingParticipants(true);

    try {
      const { data: emailsData, error: emailsError } = await supabase
        .rpc('get_user_emails_with_profiles');

      if (emailsError) throw emailsError;

      if (!emailsData) {
        setParticipants([]);
        toast({
          title: "No Data",
          description: "No participant data available",
          variant: "destructive",
        });
        return;
      }

      const { data: entriesData, error: entriesError } = await supabase
        .from('raffle_entries')
        .select('user_id, entry_count')
        .eq('raffle_id', raffleId);

      if (entriesError) throw entriesError;

      // Fetch all tickets for this raffle
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('raffle_tickets')
        .select('id, user_id, ticket_source, earned_at, metadata')
        .eq('raffle_id', raffleId)
        .order('earned_at', { ascending: false });

      const participantsList = (entriesData || []).map(entry => {
        const userInfo = emailsData.find((u: any) => u.user_id === entry.user_id);
        const userTickets = ticketsData?.filter(t => t.user_id === entry.user_id) || [];
        
        return {
          user_id: entry.user_id,
          entry_count: entry.entry_count,
          email: userInfo?.email || 'Unknown',
          display_name: userInfo?.display_name || 'Unknown',
          tickets: userTickets,
        };
      });

      setParticipants(participantsList);

      if (participantsList.length === 0) {
        toast({
          title: "No Participants Yet",
          description: "No one has entered this raffle yet",
        });
      } else {
        toast({
          title: "Participants Loaded",
          description: `Found ${participantsList.length} participants with ${ticketsData?.length || 0} total tickets`,
        });
      }
    } catch (error) {
      console.error('❌ Error in fetchParticipants:', error);
      setParticipants([]);
      toast({
        title: "Error Loading Participants",
        description: "Failed to load participants. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoadingParticipants(false);
    }
  };

  const fetchVerificationTasks = async (raffleId: string) => {
    try {
      setRefreshingVerifications(true);
      
      // Fetch raffle tasks - only show pending submissions (not verified or rejected)
      const { data, error } = await supabase
        .from('raffle_tasks')
        .select('id, user_id, task_type, instagram_username, x_username, verification_status, completed, created_at')
        .eq('raffle_id', raffleId)
        .in('task_type', ['instagram', 'x'])
        .eq('verification_status', 'submitted')
        .eq('completed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setVerificationTasks([]);
        return;
      }

      // Get emails and display names using RPC function
      const { data: emailsData } = await supabase.rpc('get_user_emails_with_profiles');

      const tasksWithEmails = data.map(task => {
        const userInfo = emailsData?.find((u: any) => u.user_id === task.user_id);
        return {
          ...task,
          email: userInfo?.email || 'N/A',
          display_name: userInfo?.display_name || 'Anonymous',
        };
      });

      setVerificationTasks(tasksWithEmails as VerificationTask[]);
    } catch (error) {
      console.error('Error fetching verification tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load verification tasks",
        variant: "destructive",
      });
    } finally {
      setRefreshingVerifications(false);
    }
  };

  const fetchVerifiedTasksHistory = async (raffleId: string) => {
    try {
      setRefreshingHistory(true);
      
      // Fetch all verified and rejected tasks
      const { data, error } = await supabase
        .from('raffle_tasks')
        .select('id, user_id, task_type, instagram_username, x_username, verification_status, completed, created_at, verified_at')
        .eq('raffle_id', raffleId)
        .in('task_type', ['instagram', 'x'])
        .in('verification_status', ['verified', 'rejected'])
        .order('verified_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setVerifiedTasksHistory([]);
        return;
      }

      // Get emails and display names using RPC function
      const { data: emailsData } = await supabase.rpc('get_user_emails_with_profiles');

      const tasksWithEmails = data.map(task => {
        const userInfo = emailsData?.find((u: any) => u.user_id === task.user_id);
        return {
          ...task,
          email: userInfo?.email || 'N/A',
          display_name: userInfo?.display_name || 'Anonymous',
        };
      });

      setVerifiedTasksHistory(tasksWithEmails as VerificationTask[]);
    } catch (error) {
      console.error('Error fetching verified tasks history:', error);
      toast({
        title: "Error",
        description: "Failed to load verification history",
        variant: "destructive",
      });
    } finally {
      setRefreshingHistory(false);
    }
  };

  const handleVerifyTask = async (taskId: string, approved: boolean, skipEmail: boolean = false) => {
    try {
      // Always use admin function for approvals to ensure entries are created with service role
      if (approved) {
        const { data, error } = await supabase.functions.invoke('admin-mark-verified', {
          body: { taskIds: [taskId], skipEmail },
        });

        if (error) throw error;

        toast({
          title: "Verified ✅",
          description: skipEmail 
            ? "Username verified without sending notification email" 
            : "Username verified and user notified via email",
        });

        // Refresh the list and participants
        const activeRaffle = raffles.find(r => r.is_active);
        if (activeRaffle) {
          fetchVerificationTasks(activeRaffle.id);
          fetchParticipants(activeRaffle.id);
        }
        return;
      }
      
      // For rejections, just update the status
      const { error } = await supabase
        .from('raffle_tasks')
        .update({ 
          verification_status: 'rejected',
          completed: false,
          verified_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Username has been rejected",
      });

      // Refresh the list
      const activeRaffle = raffles.find(r => r.is_active);
      if (activeRaffle) {
        fetchVerificationTasks(activeRaffle.id);
        fetchParticipants(activeRaffle.id);
      }
    } catch (error) {
      console.error('Error verifying task:', error);
      toast({
        title: "Error",
        description: "Failed to verify task",
        variant: "destructive",
      });
    }
  };

  const handleSendAnnouncement = async () => {
    setSendingAnnouncement(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-raffle-announcement');

      if (error) throw error;

      toast({
        title: "Announcement Sent! 🎉",
        description: `Raffle announcement sent to ${data.sent} subscribers`,
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        title: "Error",
        description: "Failed to send announcement email",
        variant: "destructive",
      });
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleSelectWinner = async (raffleId: string) => {
    if (!confirm("Are you sure you want to select a winner? This cannot be undone!")) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('select-raffle-winner', {
        body: { raffle_id: raffleId }
      });

      if (error) throw error;

      toast({
        title: "Winner Selected! 🎉",
        description: `${data.winner_name} won with ${data.total_participants} total participants!`,
      });

      fetchRaffles();
    } catch (error: any) {
      console.error('Error selecting winner:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to select winner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRaffle = async (raffleId: string, raffleTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${raffleTitle}"? This will remove all associated data including entries, tasks, and referrals. This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete associated data first (cascade should handle this, but being explicit)
      await supabase.from('raffle_entries').delete().eq('raffle_id', raffleId);
      await supabase.from('raffle_tasks').delete().eq('raffle_id', raffleId);
      await supabase.from('referrals').delete().eq('raffle_id', raffleId);
      
      // Delete the raffle
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', raffleId);

      if (error) throw error;

      toast({
        title: "Raffle Deleted",
        description: `"${raffleTitle}" has been permanently deleted.`,
      });

      fetchRaffles();
    } catch (error: any) {
      console.error('Error deleting raffle:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete raffle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEndedNotification = async (raffleId: string) => {
    if (!confirm("Send raffle ended notification to all participants?")) {
      return;
    }

    setSendingEndedNotification(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-raffle-ended', {
        body: { raffle_id: raffleId }
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent",
        description: `Raffle ended notifications sent to ${data.sent} participants`,
      });
    } catch (error: any) {
      console.error('Error sending ended notification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setSendingEndedNotification(false);
    }
  };

  const handleSendWinnerAnnouncement = async (raffleId: string) => {
    if (!confirm("Send winner announcement to all participants? This will notify the winner and all other participants.")) {
      return;
    }

    setSendingWinnerAnnouncement(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-winner-announcement', {
        body: { raffle_id: raffleId }
      });

      if (error) throw error;

      toast({
        title: "Announcements Sent",
        description: `Winner announcements sent to ${data.sent} people`,
      });
    } catch (error: any) {
      console.error('Error sending winner announcement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send announcements",
        variant: "destructive",
      });
    } finally {
      setSendingWinnerAnnouncement(false);
    }
  };

  const handleRepairTickets = async () => {
    const activeRaffle = raffles.find(r => r.is_active);
    
    if (!activeRaffle) {
      toast({
        title: "Error",
        description: "No active raffle found",
        variant: "destructive",
      });
      return;
    }

    setRepairingTickets(true);
    
    toast({
      title: "Starting Repair...",
      description: "Analyzing raffle data and fixing inconsistencies",
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('repair-raffle-tickets', {
        body: { raffleId: activeRaffle.id }
      });

      if (error) throw error;

      toast({
        title: "Repair Complete ✅",
        description: `Fixed ${data.total_fixed} users. ${data.repairs?.length || 0} corrections made.`,
      });

      // Refresh participants to show updated data
      await fetchParticipants(activeRaffle.id);
    } catch (error: any) {
      console.error('❌ Error repairing tickets:', error);
      toast({
        title: "Repair Failed",
        description: error.message || "Failed to repair tickets. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setRepairingTickets(false);
    }
  };


  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('raffles')
        .insert([{
          ...formData,
          prize_amount: parseFloat(formData.prize_amount),
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Raffle created successfully",
      });

      fetchRaffles();
      setFormData({
        title: "",
        description: "",
        prize: "Bitcoin",
        prize_amount: "50",
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        is_active: false,
      });
    } catch (error) {
      console.error('Error creating raffle:', error);
      toast({
        title: "Error",
        description: "Failed to create raffle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRaffleStatus = async (raffleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('raffles')
        .update({ is_active: !currentStatus })
        .eq('id', raffleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Raffle ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchRaffles();
    } catch (error) {
      console.error('Error toggling raffle:', error);
      toast({
        title: "Error",
        description: "Failed to update raffle status",
        variant: "destructive",
      });
    }
  };

  const exportParticipants = () => {
    if (participants.length === 0) return;

    const csv = [
      ['Email', 'Display Name', 'Entry Count'],
      ...participants.map(p => [p.email, p.display_name, p.entry_count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raffle-participants-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Raffle Manager</h2>
        <p className="text-muted-foreground">
          Manage Learn-to-Earn raffles and track participant progress
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">
            <Gift className="w-4 h-4 mr-2" />
            Create Raffle
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Trophy className="w-4 h-4 mr-2" />
            Manage Raffles
          </TabsTrigger>
          <TabsTrigger value="verification">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Verify Usernames
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Verified History
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="w-4 h-4 mr-2" />
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Raffle</CardTitle>
              <CardDescription>
                Set up a new Learn-to-Earn raffle campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRaffle} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Raffle Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Learn to Earn : Bitcoin Edition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the raffle and what participants need to do..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prize">Prize Type</Label>
                    <Input
                      id="prize"
                      value={formData.prize}
                      onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                      placeholder="Bitcoin, Ethereum, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prize_amount">Prize Amount ($)</Label>
                    <Input
                      id="prize_amount"
                      type="number"
                      value={formData.prize_amount}
                      onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Activate raffle immediately</Label>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Raffle"}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Send Announcement Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send the raffle announcement to all newsletter subscribers and registered users.
                </p>
                <Button 
                  onClick={handleSendAnnouncement}
                  disabled={sendingAnnouncement}
                  variant="secondary"
                >
                  {sendingAnnouncement ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Raffle Announcement"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Active & Past Raffles</CardTitle>
              <CardDescription>
                Manage raffle status and view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {raffles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No raffles created yet
                  </p>
                ) : (
                  raffles.map((raffle) => (
                    <div key={raffle.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{raffle.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${raffle.prize_amount} {raffle.prize}
                          </p>
                        </div>
                        <Badge variant={raffle.is_active ? "default" : "secondary"}>
                          {raffle.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Ends: {new Date(raffle.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRaffleStatus(raffle.id, raffle.is_active)}
                        >
                          {raffle.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchParticipants(raffle.id)}
                        >
                          View Participants
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchVerificationTasks(raffle.id)}
                        >
                          Check Verifications
                        </Button>
                        {!raffle.is_active && !raffle.winner_user_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendEndedNotification(raffle.id)}
                            disabled={sendingEndedNotification}
                          >
                            {sendingEndedNotification ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "📧 Send Ended Notice"
                            )}
                          </Button>
                        )}
                        {!raffle.winner_user_id && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSelectWinner(raffle.id)}
                              className="bg-yellow-500 hover:bg-yellow-600"
                            >
                              🏆 Select Winner
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteRaffle(raffle.id, raffle.title)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                        {raffle.winner_user_id && (
                          <>
                            <Badge className="bg-awareness text-accent-foreground">
                              Winner Selected ✓
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendWinnerAnnouncement(raffle.id)}
                              disabled={sendingWinnerAnnouncement}
                            >
                              {sendingWinnerAnnouncement ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "🎉 Announce Winner"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Username Verifications</CardTitle>
                  <CardDescription>
                    Review and verify submitted social media usernames
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const activeRaffle = raffles.find(r => r.is_active);
                    if (activeRaffle) {
                      fetchVerificationTasks(activeRaffle.id);
                    } else {
                      toast({
                        title: "No Active Raffle",
                        description: "Please activate a raffle first",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={refreshingVerifications}
                >
                  {refreshingVerifications ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {verificationTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending verifications. Select "Check Verifications" from the Manage tab.
                </p>
              ) : (
                <div className="space-y-4">
                  {verificationTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{task.display_name}</h3>
                          <p className="text-sm text-muted-foreground">{task.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {new Date(task.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {task.task_type}
                        </Badge>
                      </div>
                      
                      <div className="bg-accent/50 p-3 rounded-lg">
                        {task.instagram_username && (
                          <p className="text-sm">
                            <strong>Instagram:</strong> @{task.instagram_username}
                          </p>
                        )}
                        {task.x_username && (
                          <p className="text-sm">
                            <strong>X:</strong> @{task.x_username}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyTask(task.id, true)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verify & Email
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerifyTask(task.id, false)}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyTask(task.id, true, true)}
                          className="w-full"
                        >
                          ✓ Verify (No Email)
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Verified Tasks History</CardTitle>
                  <CardDescription>
                    View all verified and rejected username submissions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const activeRaffle = raffles.find(r => r.is_active);
                    if (activeRaffle) {
                      fetchVerifiedTasksHistory(activeRaffle.id);
                    } else {
                      toast({
                        title: "No Active Raffle",
                        description: "Please activate a raffle first",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={refreshingHistory}
                >
                  {refreshingHistory ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Load History
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {verifiedTasksHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No verification history yet. Click "Load History" to view verified/rejected tasks.
                </p>
              ) : (
                <div className="space-y-4">
                  {verifiedTasksHistory.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{task.display_name}</h3>
                          <p className="text-sm text-muted-foreground">{task.email}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>Submitted: {new Date(task.created_at).toLocaleDateString()}</span>
                            {task.verified_at && (
                              <span className="font-medium">
                                {task.verification_status === 'verified' ? '✅ Verified' : '❌ Rejected'}: {new Date(task.verified_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant={task.verification_status === 'verified' ? 'default' : 'destructive'}
                            className="capitalize"
                          >
                            {task.verification_status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {task.task_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-accent/50 p-3 rounded-lg">
                        {task.instagram_username && (
                          <p className="text-sm">
                            <strong>Instagram:</strong> @{task.instagram_username}
                          </p>
                        )}
                        {task.x_username && (
                          <p className="text-sm">
                            <strong>X:</strong> @{task.x_username}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Raffle Participants
                    {participants.length > 0 && (
                      <span className="text-muted-foreground ml-2">
                        ({participants.length})
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    View and export participant data
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const activeRaffle = raffles.find(r => r.is_active);
                      if (activeRaffle) {
                        fetchParticipants(activeRaffle.id);
                      } else {
                        toast({
                          title: "No Active Raffle",
                          description: "Please activate a raffle first",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={loadingParticipants}
                  >
                    {loadingParticipants ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRepairTickets}
                    disabled={repairingTickets || loadingParticipants}
                  >
                    {repairingTickets ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Repairing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Repair Data
                      </>
                    )}
                  </Button>
                  {raffles.find(r => r.is_active) && (
                    <FixTicketMismatchButton 
                      raffleId={raffles.find(r => r.is_active)!.id}
                      onFixed={() => {
                        const activeRaffle = raffles.find(r => r.is_active);
                        if (activeRaffle) {
                          fetchParticipants(activeRaffle.id);
                        }
                      }}
                    />
                  )}
                  {participants.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportParticipants}
                      disabled={loadingParticipants}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading participants...</p>
                  </div>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">No participants yet</p>
                  <p className="text-sm text-muted-foreground">
                    Click "View Participants" from the Manage tab or use the Refresh button
                  </p>
                </div>
              ) : (
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead className="text-right">Total Entries</TableHead>
                      <TableHead>Ticket Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.user_id}>
                        <TableCell className="font-mono text-sm">
                          {participant.email}
                        </TableCell>
                        <TableCell>{participant.display_name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {participant.entry_count}
                        </TableCell>
                        <TableCell>
                          {participant.tickets && participant.tickets.length > 0 ? (
                            <div className="space-y-1">
                              {participant.tickets.map((ticket) => (
                                <div key={ticket.id} className="text-xs">
                                  <Badge variant="outline" className="mr-2">
                                    {ticket.ticket_source}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {new Date(ticket.earned_at).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No ticket history</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RaffleManager;
