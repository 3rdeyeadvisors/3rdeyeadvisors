import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { User, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface ReferredUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  signed_up_at: string;
  has_paid: boolean;
  commission_status: 'pending' | 'paid' | null;
  commission_amount: number | null;
}

export const ReferredUsersList = () => {
  const { user } = useAuth();
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferredUsers();
    }
  }, [user]);

  const loadReferredUsers = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get all referrals for this user
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('referred_user_id, created_at')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      if (!referrals || referrals.length === 0) {
        setReferredUsers([]);
        setLoading(false);
        return;
      }

      // Get profiles for all referred users
      const referredUserIds = referrals.map(r => r.referred_user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', referredUserIds);

      // Get commissions for all referred users
      const { data: commissions } = await supabase
        .from('commissions')
        .select('referred_user_id, status, commission_amount_cents')
        .eq('referrer_id', user.id);

      // Combine the data
      const users: ReferredUser[] = referrals.map(referral => {
        const profile = profiles?.find(p => p.user_id === referral.referred_user_id);
        const commission = commissions?.find(c => c.referred_user_id === referral.referred_user_id);

        return {
          id: referral.referred_user_id,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          signed_up_at: referral.created_at,
          has_paid: !!commission,
          commission_status: commission?.status as 'pending' | 'paid' | null,
          commission_amount: commission?.commission_amount_cents || null,
        };
      });

      setReferredUsers(users);
    } catch (error) {
      console.error('Error loading referred users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (referredUsers.length === 0) {
    return (
      <div className="text-center py-6 text-white/50">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No referrals yet</p>
        <p className="text-xs mt-1">Share your link to start earning!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {referredUsers.map((referredUser) => (
        <Link
          key={referredUser.id}
          to={`/profile/${referredUser.id}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer border border-transparent hover:border-white/8"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={referredUser.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {(referredUser.display_name || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {referredUser.display_name || "Anonymous User"}
              </span>
              {referredUser.has_paid ? (
                <Badge className="bg-awareness/20 text-awareness border-awareness/30 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Subscribed
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Signed Up
                </Badge>
              )}
            </div>
            <p className="text-xs text-white/50">
              {format(new Date(referredUser.signed_up_at), "MMM d, yyyy")}
            </p>
          </div>

          {referredUser.has_paid && referredUser.commission_amount && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-awareness font-medium text-sm">
                <DollarSign className="w-3 h-3" />
                {(referredUser.commission_amount / 100).toFixed(2)}
              </div>
              {referredUser.commission_status === 'pending' ? (
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              ) : (
                <span className="text-xs text-awareness flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Paid
                </span>
              )}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
