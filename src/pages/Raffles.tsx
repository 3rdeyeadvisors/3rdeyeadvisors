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
  const [referralCount, setReferralCount] = useState(0);
  const [socialTasks, setSocialTasks] = useState<SocialTasks>({});
  const [winnerDisplayName, setWinnerDisplayName] = useState<string | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [participating, setParticipating] = useState(false);

  useEffect(() => {
    fetchActiveRaffle();
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
          <Card className="text-center py-12 w-full">
            <CardContent>
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Raffle Entries Currently Closed</h2>
              <p className="text-muted-foreground mb-4">
                Stay tuned for the next round!
              </p>
              {!user && (
                <Link to="/auth">
                  <Button>Sign In to Get Notified</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : activeRaffle.winner_user_id ? (
          <Card className="text-center py-12 w-full">
            <CardContent>
              <Trophy className="w-20 h-20 mx-auto mb-4 text-warning" />
              <h2 className="text-3xl font-bold mb-4">
                {isWinner ? "🎉 Congratulations! You Won! 🎉" : "Winner Announced!"}
              </h2>
              {isWinner ? (
                <div className="space-y-4">
                  <p className="text-xl text-primary font-semibold">
                    You won ${activeRaffle.prize_amount} in {activeRaffle.prize}!
                  </p>
                  <p className="text-muted-foreground">
                    Check your email for instructions on claiming your prize.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    The winner of <strong>{activeRaffle.title}</strong> is:
                  </p>
                  <p className="text-2xl font-bold text-primary">{winnerDisplayName}</p>
                  <p className="text-muted-foreground mt-4">
                    Thank you for participating! Keep learning and stay tuned for the next raffle.
                  </p>
                </div>
              )}
              <div className="mt-8">
                <Badge variant="outline" className="text-sm">
                  Winner selected on {new Date(activeRaffle.winner_selected_at!).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 w-full lg:items-start">
                {/* Raffle Details */}
                <Card className="w-full overflow-hidden">
              <CardHeader className="px-4 sm:px-6 py-4 text-center">
                <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <Trophy className="w-6 h-6 text-warning flex-shrink-0" />
                  <span className="text-center leading-tight">Current Raffle</span>
                </CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">{activeRaffle.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 text-center px-4 sm:px-6 pb-6">
                {user ? (
                  <>
                    {/* Prize */}
                    <div>
                      <h3 className="font-semibold mb-2">Prize:</h3>
                      <p className="text-2xl font-bold text-primary">
                        ${activeRaffle.prize_amount} worth of {activeRaffle.prize}
                      </p>
                    </div>

                    {/* Countdown */}
                    <div>
                      <h3 className="font-semibold mb-2">Time Remaining:</h3>
                      <RaffleCountdown endDate={activeRaffle.end_date} />
                    </div>

                    {/* User entries */}
                    <div className="pt-4 border-t">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <h3 className="font-semibold text-base">Your Entries:</h3>
                        <Badge variant="secondary" className="text-base sm:text-lg px-3 py-1.5 sm:px-4">
                          <Ticket className="w-4 h-4 mr-2" />
                          {totalEntries}
                        </Badge>
                      </div>
                      {subscription?.plan === 'founding_33' && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Badge variant="default" className="text-xs bg-amber-500 text-black">
                            <Crown className="w-3 h-3 mr-1" />
                            Founding 33: +{FOUNDING33_BENEFITS.bonusRaffleTickets} entries
                          </Badge>
                        </div>
                      )}
                      {subscription?.plan === 'annual' && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Badge variant="default" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Annual Bonus: +{ANNUAL_BENEFITS.bonusRaffleTickets} entries
                          </Badge>
                        </div>
                      )}
                      {referralCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Including {referralCount} bonus {referralCount === 1 ? 'entry' : 'entries'} from referrals
                        </p>
                      )}
                    </div>

                    {/* Join button */}
                    {!hasParticipated && (
                      <div className="pt-4 border-t">
                        <Button 
                          onClick={handleParticipate} 
                          disabled={participating}
                          className="w-full"
                          size="lg"
                        >
                          {participating ? "Joining..." : "🎯 Join This Raffle"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          {subscription?.plan === 'founding_33' 
                            ? `Start with ${1 + FOUNDING33_BENEFITS.bonusRaffleTickets} entries (Founding 33 bonus included)`
                            : subscription?.plan === 'annual' 
                              ? `Start with ${1 + ANNUAL_BENEFITS.bonusRaffleTickets} entries (annual bonus included)`
                              : 'Start with 1 entry, earn more by completing tasks'}
                        </p>
                      </div>
                    )}

                    {/* Share button */}
                    <div className="pt-4">
                      <RaffleShareButton userId={user?.id} />
                    </div>
                  </>
                ) : (
                  /* NON-LOGGED-IN: Timer + Join Button */
                  <>
                    <div>
                      <RaffleCountdown endDate={activeRaffle.end_date} />
                    </div>
                    <div className="pt-4 border-t">
                      <Link to="/auth">
                        <Button className="w-full" size="lg">
                          Join Raffle Now
                        </Button>
                      </Link>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Sign up or log in to participate
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Task Checklist - Only show for logged-in users */}
            {user && (
              <Card className="w-full">
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-lg sm:text-xl">Entry Requirements</CardTitle>
                <CardDescription className="text-sm">
                  Complete tasks to earn raffle entries
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6">
                <div className="space-y-4">
                    {/* Social Media Verification Section */}
                    <div className="space-y-3 pb-4 border-b border-border">
                      <h3 className="text-sm font-semibold text-muted-foreground">Social Media Tasks</h3>
                      
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
                    </div>

                    {/* Auto-Verified Tasks Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">Learning Tasks</h3>
                      
                      <div className="max-h-[500px] overflow-y-auto space-y-2 md:space-y-3 pr-1">
                      {AUTO_TASKS.map((task) => (
                        <div key={task.id} className="flex items-start space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <Checkbox
                            id={task.id}
                            checked={taskCompletion[task.id] || false}
                            onCheckedChange={() => handleTaskToggle(task.id)}
                            disabled={true}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={task.id}
                              className="text-sm font-medium leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block break-words"
                            >
                              {task.label}
                              <Badge variant="outline" className="ml-2 text-xs inline-block">
                                Auto-verified
                              </Badge>
                            </label>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            +{task.entries}
                          </Badge>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
              </CardContent>
              </Card>
            )}
            </div>
          </>
        )}

        {/* Legal Disclaimer */}
        <Card className="mt-8 border-muted">
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
