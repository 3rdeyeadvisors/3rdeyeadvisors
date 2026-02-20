import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Ticket, Trophy, Share2, Clock, CheckCircle2, History, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { Link } from "react-router-dom";
import RaffleCountdown from "@/components/raffles/RaffleCountdown";
import RaffleShareButton from "@/components/raffles/RaffleShareButton";
import SocialVerificationForm from "@/components/raffles/SocialVerificationForm";
import { ANNUAL_BENEFITS, FOUNDING33_BENEFITS } from "@/lib/constants";

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
  winner_selected_at?: string;
}

interface TaskCompletion {
  [key: string]: boolean;
}

interface SocialTask {
  username?: string;
  verification_status?: string;
}

interface SocialTasks {
  instagram?: SocialTask;
  x?: SocialTask;
}

const AUTO_TASKS = [
  { id: 'newsletter', label: 'Subscribe to the newsletter', entries: 1 },
  { id: 'account', label: 'Have a registered user account', entries: 1 },
  { id: 'course_foundations', label: 'Complete "DeFi Foundations" course', entries: 1 },
  { id: 'course_safety', label: 'Complete "Staying Safe with DeFi" course', entries: 1 },
  { id: 'rating', label: 'Rate a course 5 stars', entries: 1 },
  { id: 'discussion', label: 'Post in course discussion section', entries: 1 },
];

const Raffles = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskCompletion, setTaskCompletion] = useState<TaskCompletion>({});
  const [totalEntries, setTotalEntries] = useState(0);
  const [pastRaffles, setPastRaffles] = useState<Raffle[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [socialTasks, setSocialTasks] = useState<SocialTasks>({});
  const [winnerDisplayName, setWinnerDisplayName] = useState<string | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [participating, setParticipating] = useState(false);

  useEffect(() => {
    fetchActiveRaffle();
    fetchPastRaffles();
    if (user) {
      fetchUserProgress();
      fetchReferralCount();
    }
  }, [user]);

  // Comprehensive real-time subscriptions for all raffle updates
  useEffect(() => {
    if (!user || !activeRaffle) return;


    let channel: any = null;

    try {
      channel = supabase
        .channel(`raffle-updates-${activeRaffle.id}-${user.id}`)
        // Listen to entry count updates
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'raffle_entries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && 'entry_count' in payload.new) {
              setTotalEntries(payload.new.entry_count as number);
              toast({
                title: "Entries Updated! 🎉",
                description: `You now have ${payload.new.entry_count} entries!`,
              });
            }
          }
        )
        // Listen to INSERT for new entries
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'raffle_entries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && 'entry_count' in payload.new) {
              setTotalEntries(payload.new.entry_count as number);
            }
          }
        )
        // Listen to task verification status changes
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'raffle_tasks',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            fetchUserProgress(); // Refresh all task data
            
            // Show notification if task was verified
            if (payload.new && payload.new.verification_status === 'verified' && payload.old.verification_status !== 'verified') {
              toast({
                title: "Username Verified! ✅",
                description: "Your social media username has been verified. +2 entries!",
              });
            }
          }
        )
        // Listen to new task creations
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'raffle_tasks',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            fetchUserProgress();
          }
        )
        // Listen to raffle changes (winner selection, status changes)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'raffles',
            filter: `id=eq.${activeRaffle.id}`,
          },
          (payload) => {
            fetchActiveRaffle(); // Refresh raffle data
            
            if (payload.new && payload.new.winner_user_id && !payload.old.winner_user_id) {
              // Winner was just selected
              toast({
                title: "Winner Announced! 🎉",
                description: "The raffle winner has been selected. Check if you won!",
              });
            }
          }
        )
        .subscribe((status) => {
        });
    } catch (error) {
      console.error('Failed to set up real-time subscriptions:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error cleaning up channel:', error);
        }
      }
    };
  }, [user, activeRaffle]);

  useEffect(() => {
    if (activeRaffle?.winner_user_id && user) {
      setIsWinner(activeRaffle.winner_user_id === user.id);
      fetchWinnerName();
    }
  }, [activeRaffle, user]);

  const fetchActiveRaffle = async () => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Filter to find the current active raffle
      const currentRaffle = data?.find(raffle => {
        const hasStarted = new Date(raffle.start_date) <= new Date(now);
        const hasNotEnded = new Date(raffle.end_date) >= new Date(now);
        const noWinner = !raffle.winner_user_id;
        return hasStarted && hasNotEnded && noWinner;
      });
      
      setActiveRaffle(currentRaffle || null);
    } catch (error) {
      console.error('Error fetching raffle:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .not('winner_user_id', 'is', null)
        .order('winner_selected_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPastRaffles(data || []);
    } catch (error) {
      console.error('Error fetching past raffles:', error);
    }
  };

  const fetchUserProgress = async () => {
    if (!activeRaffle || !user) return;

    try {
      // Fetch task completion including social verification
      const { data: tasks } = await supabase
        .from('raffle_tasks')
        .select('task_type, completed, instagram_username, x_username, verification_status')
        .eq('raffle_id', activeRaffle.id)
        .eq('user_id', user.id);

      const completion: TaskCompletion = {};
      const social: SocialTasks = {};
      
      tasks?.forEach(task => {
        completion[task.task_type] = task.completed;
        
        if (task.task_type === 'instagram') {
          social.instagram = {
            username: task.instagram_username || undefined,
            verification_status: task.verification_status || 'pending',
          };
        } else if (task.task_type === 'x') {
          social.x = {
            username: task.x_username || undefined,
            verification_status: task.verification_status || 'pending',
          };
        }
      });
      
      setTaskCompletion(completion);
      setSocialTasks(social);

      // Fetch entry count
      const { data: entry } = await supabase
        .from('raffle_entries')
        .select('entry_count')
        .eq('raffle_id', activeRaffle.id)
        .eq('user_id', user.id)
        .single();

      setTotalEntries(entry?.entry_count || 0);
      setHasParticipated(!!entry); // User has entry = participated
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleParticipate = async () => {
    if (!user || !activeRaffle) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to participate in raffles.",
        variant: "destructive",
      });
      return;
    }

    if (hasParticipated) {
      toast({
        title: "Already Participating",
        description: "You're already in this raffle!",
      });
      return;
    }

    setParticipating(true);

    try {
      
      // Double-check if entry already exists
      const { data: existingEntry } = await supabase
        .from('raffle_entries')
        .select('entry_count')
        .eq('raffle_id', activeRaffle.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingEntry) {
        setHasParticipated(true);
        setTotalEntries(existingEntry.entry_count);
        toast({
          title: "Already Participating",
          description: "You're already in this raffle!",
        });
        setParticipating(false);
        return;
      }

      // CRITICAL FIX: Create entry first, then ticket
      // Entry must exist before trigger can update it
      // Check if user is Founding 33 member (highest tier) or annual subscriber for bonus tickets
      const isFounder = subscription?.plan === 'founding_33' || subscription?.isFounder;
      const isAnnualSubscriber = subscription?.plan === 'annual';
      
      // Founding 33 gets 10 bonus, Annual gets 5, others get 0
      let bonusTickets = 0;
      if (isFounder) {
        bonusTickets = FOUNDING33_BENEFITS.bonusRaffleTickets; // 10
      } else if (isAnnualSubscriber) {
        bonusTickets = ANNUAL_BENEFITS.bonusRaffleTickets; // 5
      }
      
      const initialEntryCount = 1 + bonusTickets;
      
      
      const { error: entryError } = await supabase
        .from('raffle_entries')
        .insert({
          user_id: user.id,
          raffle_id: activeRaffle.id,
          entry_count: initialEntryCount
        });

      if (entryError && !entryError.message.includes('duplicate')) {
        console.error('❌ Entry creation error:', entryError);
        throw entryError;
      }

      // Now create the participation ticket
      const { error: ticketError } = await supabase
        .from('raffle_tickets')
        .insert({
          user_id: user.id,
          raffle_id: activeRaffle.id,
          ticket_source: 'participation',
          metadata: { action: 'joined_raffle', timestamp: new Date().toISOString() }
        });

      if (ticketError) {
        console.error('❌ Ticket creation error:', ticketError);
        throw ticketError;
      }

      // If Founding 33 or annual subscriber, create bonus tickets
      if (bonusTickets > 0) {
        const ticketSource = isFounder ? 'founding_33_bonus' : 'annual_bonus';
        const benefitType = isFounder ? 'founding_33_member_bonus' : 'annual_subscriber_bonus';
        
        const bonusTicketInserts = Array.from({ length: bonusTickets }, () => ({
          user_id: user.id,
          raffle_id: activeRaffle.id,
          ticket_source: ticketSource,
          metadata: { 
            benefit: benefitType,
            timestamp: new Date().toISOString() 
          }
        }));
        
        const { error: bonusTicketError } = await supabase
          .from('raffle_tickets')
          .insert(bonusTicketInserts);
        
        if (bonusTicketError) {
          console.error('❌ Bonus ticket creation error:', bonusTicketError);
          // Don't throw - participation still succeeded
        } else {
        }
      }

      
      setHasParticipated(true);
      setTotalEntries(initialEntryCount);


      toast({
        title: "✅ You've joined the raffle!",
        description: isFounder 
          ? `You start with ${initialEntryCount} entries (${bonusTickets} bonus for Founding 33 members)!`
          : isAnnualSubscriber 
            ? `You start with ${initialEntryCount} entries (${bonusTickets} bonus for annual members)!`
            : "You now have 1 entry. Complete tasks to earn more!",
      });

      // Refresh to get accurate count
      await fetchUserProgress();
    } catch (error: any) {
      console.error('❌ Error joining raffle:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join raffle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setParticipating(false);
    }
  };

  const fetchReferralCount = async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .eq('bonus_awarded', true);

      setReferralCount(count || 0);
    } catch (error) {
      console.error('Error fetching referral count:', error);
    }
  };

  const fetchWinnerName = async () => {
    if (!activeRaffle?.winner_user_id) return;

    try {
      const { data: profiles } = await supabase
        .rpc('get_profiles_batch', { user_ids: [activeRaffle.winner_user_id] });

      setWinnerDisplayName(profiles?.[0]?.display_name || 'Anonymous');
    } catch (error) {
      console.error('Error fetching winner name:', error);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!user || !activeRaffle) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to participate in raffles.",
        variant: "destructive",
      });
      return;
    }

    // Ensure user has joined raffle first
    if (!hasParticipated) {
      toast({
        title: "Join Raffle First",
        description: "Please join the raffle before completing tasks.",
        variant: "destructive",
      });
      return;
    }

    const task = AUTO_TASKS.find(t => t.id === taskId);
    if (!task) return;

    const newValue = !taskCompletion[taskId];

    try {
      
      const { error: taskError } = await supabase
        .from('raffle_tasks')
        .upsert({
          raffle_id: activeRaffle.id,
          user_id: user.id,
          task_type: taskId,
          completed: newValue,
          verified_at: newValue ? new Date().toISOString() : null,
        }, {
          onConflict: 'raffle_id,user_id,task_type'
        });

      if (taskError) {
        console.error('❌ Task update error:', taskError);
        throw taskError;
      }

      // Optimistically update UI
      setTaskCompletion(prev => ({ ...prev, [taskId]: newValue }));

      // If completing task, create ticket and update entry count
      if (newValue) {
        
        const { error: ticketError } = await supabase
          .from('raffle_tickets')
          .insert({
            raffle_id: activeRaffle.id,
            user_id: user.id,
            ticket_source: 'task_completion',
            metadata: { 
              task_type: taskId,
              task_label: task.label,
              entries: task.entries,
              timestamp: new Date().toISOString()
            }
          });

        if (ticketError) {
          console.error('❌ Ticket creation failed:', ticketError);
          throw ticketError;
        }

      } else {
        // User unchecked - remove the ticket and adjust count
        
        // Delete the specific ticket
        await supabase
          .from('raffle_tickets')
          .delete()
          .eq('raffle_id', activeRaffle.id)
          .eq('user_id', user.id)
          .eq('ticket_source', 'task_completion')
          .contains('metadata', { task_type: taskId });

        // Manually decrement count
        const newCount = Math.max(1, totalEntries - task.entries); // Never go below 1 (participation entry)
        await supabase
          .from('raffle_entries')
          .update({ entry_count: newCount })
          .eq('raffle_id', activeRaffle.id)
          .eq('user_id', user.id);
        
        setTotalEntries(newCount);
      }

      // Wait a bit for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 400));

      // Refresh to get accurate count
      await fetchUserProgress();

      const updatedTotal = totalEntries + (newValue ? task.entries : -task.entries);

      toast({
        title: newValue ? "Task Completed! ✅" : "Task Unchecked",
        description: newValue 
          ? `You earned ${task.entries} more ${task.entries === 1 ? 'entry' : 'entries'}!`
          : `${task.entries} ${task.entries === 1 ? 'entry' : 'entries'} removed.`,
      });
    } catch (error: any) {
      console.error('❌ Error updating task:', error);
      // Revert optimistic update
      setTaskCompletion(prev => ({ ...prev, [taskId]: !newValue }));
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialVerificationSubmit = async (taskType: string, username: string) => {
    if (!user || !activeRaffle) return;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Learn to Earn Raffles: 3rdeyeadvisors"
        description="Participate in our Learn-to-Earn raffles. Complete educational tasks and earn entries to win crypto rewards. Awareness = Advantage."
        keywords="defi raffles, crypto giveaway, learn to earn, bitcoin rewards, defi education"
      />

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Community"
          title="Enter to Win"
          subtitle="Complete educational tasks to earn raffle entries. Learn more, earn more entries, win real rewards."
        />

      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="flex justify-center mb-12 -mt-4">
          <Link to="/raffle-history">
            <Button variant="outline" className="font-body text-xs uppercase tracking-widest border-white/10 text-white hover:bg-white/5 rounded-full px-6">
              <History className="w-4 h-4 mr-2" />
              View Raffle History
            </Button>
          </Link>
        </div>

        {/* Philosophy Section */}
        <Card className="mb-8 border-primary/20 w-full">
          <CardContent className="pt-6 px-4 md:px-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-base sm:text-lg mb-4 text-foreground">
                At <span className="font-semibold text-primary">3rdeyeadvisors</span>, we believe in <span className="font-semibold">earning after learning</span>, returning that energy back to you.
              </p>
              
              <p className="text-base sm:text-lg mb-4 text-foreground">
                This is not just another giveaway. <span className="font-semibold">It is a challenge to grow.</span>
              </p>

              <p className="text-base sm:text-lg mb-4 text-foreground">
                What we do not want are individuals afraid to take the next step in life. You lose nothing by learning, but you gain everything:
              </p>

              <ul className="space-y-2 mb-4 list-disc list-inside text-foreground/70">
                <li>The foundation to become your own bank</li>
                <li>A financial system with no geographical discrimination</li>
                <li>The ability to invest on a larger scale</li>
                <li>Ownership of your own digital assets</li>
                <li>Access to a global community of thinkers, learners, and builders</li>
              </ul>

              <p className="text-base sm:text-lg font-semibold text-primary">
                Keep learning. Keep sharing. Keep growing the decentralized movement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Raffle or Closed Message */}
        {!activeRaffle ? (
          <Card className="bg-white/3 border border-white/8 rounded-3xl text-center py-16 w-full">
            <CardContent>
              <Clock className="w-16 h-16 mx-auto mb-6 text-white/20" />
              <h2 className="font-consciousness text-2xl font-bold text-white mb-2">Raffle Entries Currently Closed</h2>
              <p className="font-body text-white/50 mb-8 max-w-sm mx-auto">
                Stay tuned for the next round of rewards and challenges.
              </p>
              {!user && (
                <Link to="/auth">
                  <Button className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8">Sign In to Get Notified</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : activeRaffle.winner_user_id ? (
          <Card className="bg-white/3 border border-white/8 rounded-3xl text-center py-16 w-full">
            <CardContent>
              <Trophy className="w-20 h-20 mx-auto mb-6 text-amber-400" />
              <h2 className="font-consciousness text-3xl font-bold text-white mb-4">
                {isWinner ? "Congratulations! You Won!" : "Winner Announced!"}
              </h2>
              {isWinner ? (
                <div className="space-y-4">
                  <p className="font-consciousness text-xl text-violet-400 font-bold">
                    You won ${activeRaffle.prize_amount} in {activeRaffle.prize}!
                  </p>
                  <p className="font-body text-white/50">
                    Check your email for instructions on claiming your prize.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-body text-lg text-white/60">
                    The winner of <span className="font-consciousness text-white">{activeRaffle.title}</span> is:
                  </p>
                  <p className="font-consciousness text-2xl font-bold text-amber-400">{winnerDisplayName}</p>
                  <p className="font-body text-white/40 mt-4">
                    Thank you for participating: Keep learning and stay tuned for the next raffle.
                  </p>
                </div>
              )}
              <div className="mt-8">
                <Badge variant="outline" className="font-body text-xs uppercase tracking-widest border-white/10 text-white/40">
                  Winner selected on {new Date(activeRaffle.winner_selected_at!).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
                {/* Raffle Details */}
                <div className="relative overflow-hidden bg-gradient-to-b from-violet-950/40 to-black border border-violet-500/30 rounded-3xl p-6 md:p-8">
                  <div className="absolute top-0 right-0 p-4">
                    <Trophy className="w-12 h-12 text-violet-500/20" />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div>
                      <p className="font-body text-xs uppercase tracking-widest text-violet-400 mb-2">Current Prize</p>
                      <h2 className="font-consciousness text-4xl md:text-5xl font-bold text-white">
                        ${activeRaffle.prize_amount}
                      </h2>
                      <p className="font-body text-lg text-white/60 mt-1">{activeRaffle.prize}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-2">Time Remaining</p>
                        <div className="font-consciousness text-2xl font-bold text-amber-400">
                          <RaffleCountdown endDate={activeRaffle.end_date} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-2">Your Entries</p>
                        <div className="font-consciousness text-5xl font-bold text-violet-400">
                          {totalEntries}
                        </div>
                        <p className="font-body text-[10px] text-white/30 uppercase tracking-tighter mt-1">Total Entries</p>
                      </div>
                    </div>

                    {user ? (
                      <div className="space-y-4 pt-6">
                        {!hasParticipated ? (
                          <Button
                            onClick={handleParticipate}
                            disabled={participating}
                            className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white py-6 rounded-xl text-base transition-all"
                          >
                            {participating ? "Joining..." : "Join This Raffle"}
                          </Button>
                        ) : (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="font-body text-sm text-emerald-400">You are in the draw</span>
                          </div>
                        )}
                        <RaffleShareButton userId={user?.id} />
                      </div>
                    ) : (
                      <div className="pt-6">
                        <Link to="/auth">
                          <Button className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white py-6 rounded-xl text-base transition-all">
                            Sign In to Join Raffle
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Checklist */}
                {user && (
                  <div className="bg-white/3 border border-white/8 rounded-3xl p-6 md:p-8">
                    <h3 className="font-consciousness text-xl font-bold text-white mb-2">Earn Entries</h3>
                    <p className="font-body text-sm text-white/40 mb-8">Complete the following tasks to increase your chances.</p>

                    <div className="space-y-3">
                      {/* Social Media Tasks */}
                      <SocialVerificationForm
                        raffleId={activeRaffle.id}
                        userId={user.id}
                        taskType="instagram"
                        existingUsername={socialTasks.instagram?.username}
                        verificationStatus={socialTasks.instagram?.verification_status}
                        onSubmit={fetchUserProgress}
                      />
                      
                      <SocialVerificationForm
                        raffleId={activeRaffle.id}
                        userId={user.id}
                        taskType="x"
                        existingUsername={socialTasks.x?.username}
                        verificationStatus={socialTasks.x?.verification_status}
                        onSubmit={fetchUserProgress}
                      />

                      {/* Learning Tasks */}
                      {AUTO_TASKS.map((task) => {
                        const isCompleted = taskCompletion[task.id];
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                              isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/8 bg-white/3 hover:border-violet-500/20'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isCompleted ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' : 'border-white/20 text-transparent'}`}>
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <span className="font-body text-sm text-white flex-1">{task.label}</span>
                            <span className="font-consciousness text-sm font-bold text-violet-400">+{task.entries}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            {/* Bonus Status for Premium Members */}
            {user && (subscription?.plan === 'founding_33' || subscription?.plan === 'annual') && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-consciousness text-lg font-bold text-white">Premium Bonus Active</h4>
                    <p className="font-body text-sm text-white/50">
                      {subscription?.plan === 'founding_33'
                        ? `Founding 33 members receive +${FOUNDING33_BENEFITS.bonusRaffleTickets} bonus entries automatically.`
                        : `Annual subscribers receive +${ANNUAL_BENEFITS.bonusRaffleTickets} bonus entries automatically.`
                      }
                    </p>
                  </div>
                </div>
                <div className="font-consciousness text-2xl font-bold text-amber-400">
                  +{subscription?.plan === 'founding_33' ? FOUNDING33_BENEFITS.bonusRaffleTickets : ANNUAL_BENEFITS.bonusRaffleTickets} PTS
                </div>
              </div>
            )}
          </div>
        )}

        {/* Past Raffles Section */}
        {pastRaffles.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-consciousness text-2xl font-bold text-white">Past Winners</h3>
              <Link to="/raffle-history" className="font-body text-xs uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">
                View All History
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastRaffles.map((raffle) => (
                <div key={raffle.id} className="bg-white/3 border border-white/8 rounded-xl p-6 hover:border-white/15 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-widest text-white/30">Winner</p>
                      <p className="font-consciousness text-sm font-bold text-amber-400">
                        {raffle.id.slice(0, 8)}... {/* Mock name as we don't have winner name here easily */}
                      </p>
                    </div>
                  </div>
                  <p className="font-body text-sm text-white/60 mb-2 truncate">{raffle.prize}</p>
                  <p className="font-body text-xs text-white/30">
                    {new Date(raffle.winner_selected_at!).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <Card className="mt-16 bg-transparent border-white/5">
          <CardContent className="pt-6">
            <p className="text-xs text-foreground/60 text-center">
              <strong>Disclaimer:</strong> Educational participation only. No purchase necessary. 
              Winners are selected randomly from verified participants who have completed the learning 
              and engagement requirements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Raffles;
