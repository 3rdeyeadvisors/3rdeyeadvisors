import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, Share2 } from "lucide-react";

interface SocialVerificationFormProps {
  raffleId: string;
  userId: string;
  taskType: 'instagram' | 'x';
  existingUsername?: string;
  verificationStatus?: string;
  onSubmit: () => void;
}

const SocialVerificationForm = ({ 
  raffleId, 
  userId, 
  taskType, 
  existingUsername,
  verificationStatus = 'pending',
  onSubmit 
}: SocialVerificationFormProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState(existingUsername || '');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const platform = taskType === 'instagram' ? 'Instagram' : 'Instagram';
  const platformHandle = taskType === 'instagram' ? '@3rdeyeadvisors' : '@3rdeyeadvisors';
  const platformLink = taskType === 'instagram' 
    ? 'https://instagram.com/3rdeyeadvisors' 
    : 'https://www.instagram.com/3rdeyeadvisors';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: `Please enter your ${platform} username`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const fieldName = taskType === 'instagram' ? 'instagram_username' : 'x_username';
      
      const { error } = await supabase
        .from('raffle_tasks')
        .upsert({
          raffle_id: raffleId,
          user_id: userId,
          task_type: taskType,
          [fieldName]: username.replace('@', ''), // Remove @ if user included it
          verification_status: 'submitted',
          completed: false,
        }, {
          onConflict: 'raffle_id,user_id,task_type'
        });

      if (error) throw error;

      toast({
        title: "Submitted for Verification! ✅",
        description: `Your ${platform} username has been submitted. We'll verify it soon.`,
      });

      setIsEditing(false);
      onSubmit();
    } catch (error) {
      console.error('Error submitting username:', error);
      toast({
        title: "Error",
        description: "Failed to submit username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              {platform} Verification
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Follow {platformHandle} and share/retweet content
            </p>
            <a
              href={platformLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Visit {platform} <Share2 className="w-3 h-3" />
            </a>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs"
          >
            +2 entries
          </Badge>
        </div>

        {verificationStatus === 'verified' ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-500">✅ Verified</p>
              <p className="text-xs text-muted-foreground">@{existingUsername}</p>
            </div>
          </div>
        ) : verificationStatus === 'submitted' && !isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-500">⏳ Pending Verification</p>
                <p className="text-xs text-muted-foreground">@{existingUsername}</p>
              </div>
            </div>
            <Button 
              type="button"
              variant="outline"
              size="sm" 
              className="w-full"
              onClick={() => {
                setIsEditing(true);
                setUsername(existingUsername || '');
              }}
            >
              Change Username
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`${taskType}-username`} className="text-xs">
                Your {platform} Username
              </Label>
              <Input
                id={`${taskType}-username`}
                type="text"
                placeholder={`your${taskType}handle`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {isEditing && (
                <Button 
                  type="button"
                  variant="outline"
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(existingUsername || '');
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                size="sm" 
                className={isEditing ? "flex-1" : "w-full"}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : isEditing ? "Update" : "Submit for Verification"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};

export default SocialVerificationForm;
