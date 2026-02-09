import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { useSingleFoundingMemberStatus } from '@/hooks/useFoundingMemberStatus';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type VoteType = 'yes' | 'no';

interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string | null;
  voting_ends_at: string | null;
  yes_votes: number;
  no_votes: number;
  net_votes: number;
  user_vote_type: VoteType | null;
}

interface RoadmapVote {
  id: string;
  roadmap_item_id: string;
  user_id: string;
  vote_weight: number | null;
  vote_type: string;
  created_at: string | null;
}

export const useRoadmapVotes = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { isFoundingMember, loading: foundingLoading } = useSingleFoundingMemberStatus(user?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [voting, setVoting] = useState<string | null>(null);

  // Determine vote weight based on membership
  // Check founding33_purchases, grandfathered founding_33 members, admins, and all grandfathered users
  const isFounder = isFoundingMember || 
    subscription?.plan === 'founding_33' || 
    subscription?.isFounder || 
    subscription?.isAdmin ||
    subscription?.isGrandfathered; // Grandfathered users get Founding tier voting power
  
  const getVoteWeight = useCallback((): number => {
    if (isFounder) return 3;
    if (subscription?.plan === 'annual') return 1;
    return 0; // Cannot vote
  }, [isFounder, subscription?.plan]);

  const canVote = useCallback((): boolean => {
    return getVoteWeight() > 0;
  }, [getVoteWeight]);

  const getVotingTier = useCallback((): 'founding' | 'annual' | 'none' => {
    if (isFounder) return 'founding';
    if (subscription?.plan === 'annual') return 'annual';
    return 'none';
  }, [isFounder, subscription?.plan]);

  // 1. Query for roadmap items
  const { data: items = [], isLoading: itemsLoading, refetch: refreshItems } = useQuery({
    queryKey: ['roadmap-items', user?.id],
    queryFn: async () => {
      // Fetch roadmap items
      const { data: itemsData, error: itemsError } = await supabase
        .from('roadmap_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch aggregate vote counts from secure view
      const { data: voteCounts, error: voteCountsError } = await supabase
        .from('roadmap_vote_counts')
        .select('*');

      if (voteCountsError) throw voteCountsError;

      // Fetch current user's votes
      const { data: userVotes, error: userVotesError } = user
        ? await supabase
            .from('roadmap_votes')
            .select('roadmap_item_id, vote_type')
            .eq('user_id', user.id)
        : { data: [], error: null };

      if (userVotesError) throw userVotesError;

      const voteCountsMap = new Map<string, { yes: number, no: number }>(
        (voteCounts || []).map((vc) => [
          vc.roadmap_item_id,
          { yes: vc.yes_votes, no: vc.no_votes }
        ])
      );

      const userVoteMap = new Map<string, VoteType>(
        (userVotes || []).map((v) => [
          v.roadmap_item_id,
          v.vote_type as VoteType
        ])
      );

      const processedItems: RoadmapItem[] = (itemsData || []).map((item) => {
        const counts = voteCountsMap.get(item.id) || { yes: 0, no: 0 };
        const userVoteType = userVoteMap.get(item.id) || null;

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          created_at: item.created_at,
          voting_ends_at: (item as { voting_ends_at?: string | null }).voting_ends_at || null,
          yes_votes: counts.yes,
          no_votes: counts.no,
          net_votes: counts.yes - counts.no,
          user_vote_type: userVoteType,
        };
      });

      return processedItems.sort((a, b) => b.net_votes - a.net_votes);
    },
  });

  // Check if voting is still open for an item
  const isVotingOpen = useCallback((item: RoadmapItem): boolean => {
    if (item.status === 'completed') return false;
    if (!item.voting_ends_at) return true; // Legacy items without deadline
    return new Date(item.voting_ends_at) > new Date();
  }, []);

  // 2. Mutation for casting a vote
  const castVoteMutation = useMutation({
    mutationFn: async ({ roadmapItemId, voteType }: { roadmapItemId: string, voteType: VoteType }) => {
      if (!user) throw new Error('Sign in required');
      if (!canVote()) throw new Error('Annual subscription required');

      const item = items.find(i => i.id === roadmapItemId);
      if (item && !isVotingOpen(item)) throw new Error('Voting closed');

      const voteWeight = getVoteWeight();
      const existingVote = item?.user_vote_type;

      if (existingVote === voteType) return { alreadyVoted: true };

      if (existingVote) {
        const { error } = await supabase
          .from('roadmap_votes')
          .update({ vote_type: voteType })
          .eq('roadmap_item_id', roadmapItemId)
          .eq('user_id', user.id);
        if (error) throw error;
        return { updated: true };
      } else {
        const { error } = await supabase.from('roadmap_votes').insert({
          roadmap_item_id: roadmapItemId,
          user_id: user.id,
          vote_weight: voteWeight,
          vote_type: voteType,
        });
        if (error) throw error;

        // Award points
        try {
          await supabase.rpc('award_user_points', {
            _user_id: user.id,
            _points: 15,
            _action_type: 'roadmap_vote',
            _action_id: roadmapItemId,
            _metadata: { item_title: item?.title, vote_type: voteType }
          });
        } catch (e) {
          console.error('Error awarding points:', e);
        }
        return { created: true };
      }
    },
    onSuccess: (result) => {
      if (result.alreadyVoted) {
        toast({ title: 'Already voted' });
      } else if (result.updated) {
        toast({ title: 'Vote updated' });
      } else if (result.created) {
        toast({ title: 'Vote cast! +15 points' });
      }
      queryClient.invalidateQueries({ queryKey: ['roadmap-items', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-vote-counts'] });
    }
  });

  const castVote = useCallback(async (roadmapItemId: string, voteType: VoteType) => {
    try {
      setVoting(roadmapItemId);
      await castVoteMutation.mutateAsync({ roadmapItemId, voteType });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cast vote',
        variant: 'destructive',
      });
      return false;
    } finally {
      setVoting(null);
    }
  }, [castVoteMutation, toast]);

  // 3. Mutation for removing a vote
  const removeVoteMutation = useMutation({
    mutationFn: async (roadmapItemId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from('roadmap_votes')
        .delete()
        .eq('roadmap_item_id', roadmapItemId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Vote removed' });
      queryClient.invalidateQueries({ queryKey: ['roadmap-items', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-vote-counts'] });
    }
  });

  const removeVote = useCallback(async (roadmapItemId: string) => {
    try {
      setVoting(roadmapItemId);
      await removeVoteMutation.mutateAsync(roadmapItemId);
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove vote',
        variant: 'destructive',
      });
      return false;
    } finally {
      setVoting(null);
    }
  }, [removeVoteMutation, toast]);

  return {
    items,
    loading: itemsLoading || foundingLoading,
    voting,
    canVote: canVote(),
    votingTier: getVotingTier(),
    voteWeight: getVoteWeight(),
    isVotingOpen,
    castVote,
    removeVote,
    refreshItems,
  };
};

// Admin hook for managing roadmap items
export const useRoadmapAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createItem = async (title: string, description: string): Promise<string | null> => {
    setLoading(true);
    try {
      // Set voting deadline to 7 days from now
      const votingEndsAt = new Date();
      votingEndsAt.setDate(votingEndsAt.getDate() + 7);

      const { data, error } = await supabase.from('roadmap_items').insert({
        title,
        description,
        status: 'proposed',
        voting_ends_at: votingEndsAt.toISOString(),
      }).select('id').single();

      if (error) throw error;

      // Trigger email notification to all subscribers
      try {
        await supabase.functions.invoke('send-roadmap-item-created', {
          body: { item_id: data.id }
        });
      } catch (emailError) {
        console.error('Error sending roadmap email:', emailError);
        // Don't fail the create if email fails
      }

      toast({
        title: 'Success',
        description: 'Roadmap item created & email sent to subscribers',
      });
      return data.id;
    } catch (error) {
      console.error('Error creating roadmap item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create roadmap item',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (
    itemId: string,
    status: 'proposed' | 'in_progress' | 'completed'
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('roadmap_items')
        .update({ status })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Status updated',
      });
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    setLoading(true);
    try {
      // First delete all votes for this item
      await supabase.from('roadmap_votes').delete().eq('roadmap_item_id', itemId);

      // Then delete the item
      const { error } = await supabase
        .from('roadmap_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Roadmap item deleted',
      });
      return true;
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete roadmap item',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createItem,
    updateItemStatus,
    deleteItem,
  };
};
