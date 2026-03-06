import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Map, Crown, Star, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRoadmapVotes, VoteType } from '@/hooks/useRoadmapVotes';
import { useFeatureSuggestions } from '@/hooks/useFeatureSuggestions';
import { useAuth } from '@/components/auth/AuthProvider';
import { RoadmapCard } from '@/components/roadmap/RoadmapCard';
import { FeatureSuggestionForm } from '@/components/roadmap/FeatureSuggestionForm';
import { FeatureSuggestionsList } from '@/components/roadmap/FeatureSuggestionsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import PageHero from "@/components/PageHero";

const Roadmap = () => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const {
    items,
    loading,
    voting,
    canVote,
    votingTier,
    voteWeight,
    isVotingOpen,
    castVote,
    removeVote,
  } = useRoadmapVotes();

  const {
    suggestions,
    loading: suggestionsLoading,
    submitting,
    submitSuggestion,
  } = useFeatureSuggestions();

  const statusOptions = ['All', 'Proposed', 'In Progress', 'Completed'];

  const filteredItems = items.filter((item) => {
    if (selectedStatus === 'All') return true;
    if (selectedStatus === 'Proposed') return item.status === 'proposed' || !item.status;
    if (selectedStatus === 'In Progress') return item.status === 'in_progress';
    if (selectedStatus === 'Completed') return item.status === 'completed';
    return true;
  });

  const getStatusStyle = (status: string) => {
    const isActive = status === selectedStatus;
    return isActive
      ? "bg-violet-600 border-violet-600 text-white"
      : "border-white/15 text-white/50 hover:border-violet-500/30 hover:text-white/80 bg-transparent";
  };

  return (
    <>
      <SEO
        title="Platform Roadmap | Sentinel DeFi"
        description="Vote on upcoming features and see what is being built next on the Sentinel DeFi DeFi education platform."
        keywords="DeFi platform roadmap, crypto education features, community voting, DeFi tools upcoming"
        url="https://www.sentineldefi.online/roadmap"
      />

      <div className="min-h-screen bg-transparent overflow-hidden relative">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Community Driven"
          title="What Gets Built Next"
          subtitle="You vote on the features. The platform is community run and your input shapes every release."
        />

        <section className="relative pb-10 z-10">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {/* Voting Power Explainer */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Crown className="w-4 h-4" />
                  <span className="font-body text-[10px] uppercase tracking-widest font-bold">Founding 33 = 3x Power</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400">
                  <Star className="w-4 h-4" />
                  <span className="font-body text-[10px] uppercase tracking-widest font-bold">Annual = 1x Power</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                  <Lock className="w-4 h-4" />
                  <span className="font-body text-[10px] uppercase tracking-widest font-bold">View Only</span>
                </div>
              </div>

              {/* User Status */}
              {!user ? (
                <div className="pt-2">
                  <Button asChild size="sm">
                    <Link to="/auth">
                      Sign In to Vote <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : !canVote ? (
                <div className="pt-2">
                  <p className="font-body text-xs sm:text-sm text-white/50 mb-2">
                    Upgrade to Annual or join Founding 33 to unlock voting
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/subscription">
                      View Plans <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="pt-4">
                  <Badge
                    variant="outline"
                    className={
                      votingTier === 'founding'
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
                        : 'bg-primary/10 border-primary/30 text-primary'
                    }
                  >
                    {votingTier === 'founding' ? (
                      <>
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        3x Voting Power Active
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 mr-1.5" />
                        1x Voting Power Active
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Category/Status Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 relative z-10">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`font-body text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border transition-all ${getStatusStyle(status)}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Roadmap Items */}
        <section className="py-4 md:py-6 relative z-10 min-h-[400px]">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Map className="w-12 h-12 mx-auto text-white/10 mb-4" />
                <h3 className="text-xl font-consciousness font-bold text-white mb-2">
                  No items found
                </h3>
                <p className="text-sm text-white/40 font-body">
                  There are currently no items in this category.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {filteredItems.map((item) => (
                  <RoadmapCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    status={item.status}
                    votingEndsAt={item.voting_ends_at}
                    yesVotes={item.yes_votes}
                    noVotes={item.no_votes}
                    netVotes={item.net_votes}
                    userVoteType={item.user_vote_type}
                    canVote={canVote}
                    votingTier={votingTier}
                    voteWeight={voteWeight}
                    isVoting={voting === item.id}
                    isVotingOpen={isVotingOpen(item)}
                    onVote={(voteType: VoteType) => castVote(item.id, voteType)}
                    onRemoveVote={() => removeVote(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Feature Suggestions Section */}
        <section className="py-8 md:py-12 border-t border-white/5 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-consciousness font-bold mb-2">
                  Have a Feature Idea?
                </h2>
                <p className="font-body text-sm text-white/50 max-w-md mx-auto">
                  Premium members can submit ideas for consideration. Popular suggestions may be promoted to the public roadmap.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Submit Form */}
                <FeatureSuggestionForm
                  canSubmit={canVote}
                  submitting={submitting}
                  onSubmit={submitSuggestion}
                />

                {/* Recent Ideas List */}
                <FeatureSuggestionsList
                  suggestions={suggestions}
                  loading={suggestionsLoading}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Roadmap;
