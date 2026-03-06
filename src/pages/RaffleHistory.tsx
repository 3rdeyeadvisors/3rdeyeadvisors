import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Users, DollarSign, Search, History } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { Link } from "react-router-dom";

interface RaffleHistoryItem {
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
  winner_display_name?: string;
  participant_count?: number;
}

const RaffleHistory = () => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState<RaffleHistoryItem[]>([]);
  const [filteredRaffles, setFilteredRaffles] = useState<RaffleHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchRaffleHistory();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, filterStatus, sortBy, raffles]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchRaffleHistory = async () => {
    try {
      setLoading(true);

      // Fetch raffles that have a winner or are active (excludes inactive test raffles)
      const { data: rafflesData, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .or('winner_user_id.not.is.null,is_active.eq.true')
        .order('created_at', { ascending: false });

      if (rafflesError) throw rafflesError;

      // For each raffle, fetch participant count and winner info
      const enrichedRaffles = await Promise.all(
        (rafflesData || []).map(async (raffle) => {
          // Get participant count
          const { count } = await supabase
            .from('raffle_entries')
            .select('*', { count: 'exact', head: true })
            .eq('raffle_id', raffle.id);

          // Get winner display name if exists using secure function
          let winnerDisplayName = undefined;
          if (raffle.winner_user_id) {
            const { data: profiles } = await supabase
              .rpc('get_profiles_batch', { user_ids: [raffle.winner_user_id] });

            winnerDisplayName = profiles?.[0]?.display_name || 'Anonymous';
          }

          return {
            ...raffle,
            participant_count: count || 0,
            winner_display_name: winnerDisplayName,
          };
        })
      );

      setRaffles(enrichedRaffles);
    } catch (error) {
      console.error('Error fetching raffle history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...raffles];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (raffle) =>
          raffle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          raffle.prize.toLowerCase().includes(searchQuery.toLowerCase()) ||
          raffle.winner_display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === "completed") {
      filtered = filtered.filter((raffle) => raffle.winner_user_id);
    } else if (filterStatus === "active") {
      filtered = filtered.filter((raffle) => raffle.is_active && !raffle.winner_user_id);
    } else if (filterStatus === "closed") {
      filtered = filtered.filter((raffle) => !raffle.is_active && !raffle.winner_user_id);
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
    } else if (sortBy === "participants") {
      filtered.sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));
    } else if (sortBy === "prize") {
      filtered.sort((a, b) => b.prize_amount - a.prize_amount);
    }

    setFilteredRaffles(filtered);
  };

  const getRaffleStatus = (raffle: RaffleHistoryItem) => {
    if (raffle.winner_user_id) {
      return { label: "Completed", color: "bg-success" };
    } else if (raffle.is_active) {
      return { label: "Active", color: "bg-primary" };
    } else {
      return { label: "Closed", color: "bg-white/5" };
    }
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
        title="Raffle Winners History | Sentinel DeFi"
        description="See past raffle winners and prize distributions in the Sentinel DeFi community."
        keywords="DeFi raffle winners, crypto giveaway history, community rewards"
        url="https://www.sentineldefi.online/raffle-history"
      />

      <div className="min-h-screen bg-transparent pb-20">
        <PageHero
          eyebrow="Archive"
          title="Raffle History"
          subtitle="Every past raffle, winner, and prize. A full record of the community reward program."
        />

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-12 -mt-4">
            <Link to="/raffles">
              <Button variant="outline" className="font-body text-xs uppercase tracking-widest border-white/10 text-white hover:bg-white/5 rounded-full px-6">
                <Trophy className="w-4 h-4 mr-2" />
                View Current Raffle
              </Button>
            </Link>
          </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Raffles</p>
                <p className="font-consciousness text-2xl font-bold text-white">{raffles.length}</p>
              </div>
              <History className="w-6 h-6 text-violet-400" />
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Completed</p>
                <p className="font-consciousness text-2xl font-bold text-emerald-400">
                  {raffles.filter((r) => r.winner_user_id).length}
                </p>
              </div>
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Participants</p>
                  <p className="font-consciousness text-2xl font-bold text-violet-400">
                    {raffles.reduce((sum, r) => sum + (r.participant_count || 0), 0)}
                  </p>
                </div>
                <Users className="w-6 h-6 text-violet-400" />
              </div>
            </div>
          )}

          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Prizes</p>
                <p className="font-consciousness text-2xl font-bold text-amber-400">
                  ${raffles.reduce((sum, r) => sum + r.prize_amount, 0)}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search raffles, prizes, or winners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-violet-500/50"
                  />
                </div>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="all">All Raffles</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="participants">Most Participants</SelectItem>
                  <SelectItem value="prize">Highest Prize</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="font-body text-sm text-white/40">
            Showing {filteredRaffles.length} of {raffles.length} raffles
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaffles.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white/3 border border-white/8 rounded-3xl">
              <Trophy className="w-12 h-12 mx-auto text-white/10 mb-4" />
              <h3 className="font-consciousness text-xl font-bold text-white mb-2">No raffles found</h3>
              <p className="font-body text-sm text-white/40">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredRaffles.map((raffle) => {
              return (
                <div key={raffle.id} className="bg-white/3 border border-white/8 rounded-2xl p-5 md:p-6 hover:border-white/15 transition-all flex flex-col h-full group">
                  <div className="flex-1">
                    <h3 className="font-consciousness text-lg font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{raffle.title}</h3>
                    <p className="font-body text-xs text-white/40 uppercase tracking-wider mb-4">
                      {new Date(raffle.start_date).toLocaleDateString()} to {new Date(raffle.end_date).toLocaleDateString()}
                    </p>

                    <div className="mb-6">
                      <p className="font-consciousness text-2xl font-bold text-amber-400">${raffle.prize_amount}</p>
                      <p className="font-body text-sm text-white/50">{raffle.prize}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/8 mt-4 pt-4 space-y-4">
                    {raffle.winner_user_id ? (
                      <div>
                        <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-1">Winner</p>
                        <p className="font-consciousness text-base font-bold text-amber-300">{raffle.winner_display_name}</p>
                      </div>
                    ) : (
                      <Badge className="bg-violet-500/10 text-violet-400 border-none font-body text-[10px] uppercase tracking-widest">
                        Currently Active
                      </Badge>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-body text-xs">{raffle.participant_count || 0} Entries</span>
                      </div>
                      {raffle.winner_selected_at && (
                        <span className="font-body text-[10px] text-white/40 uppercase">
                          {new Date(raffle.winner_selected_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Call to Action */}
        {filteredRaffles.some((r) => r.is_active && !r.winner_user_id) && (
          <div className="mt-12 bg-gradient-to-r from-violet-900/20 to-violet-600/20 border border-violet-500/20 rounded-3xl p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-violet-400" />
              <h3 className="font-consciousness text-2xl font-bold text-white mb-2">Active Raffle Available!</h3>
              <p className="font-body text-white/50 mb-8">
                Don't miss your chance to win. Participate now and earn entries.
              </p>
              <Link to="/raffles">
                <Button className="font-body bg-violet-600 hover:bg-violet-500 text-white px-12 py-6 rounded-xl transition-all">
                  Join Now
                </Button>
              </Link>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-16 text-center">
          <p className="font-body text-xs text-white/40 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-white/40 uppercase tracking-widest mr-2">About Raffle History:</strong>
            This page displays the complete history of our Learn-to-Earn raffles.
            All winners were selected randomly from verified participants using a weighted selection based on entry counts.
          </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RaffleHistory;
