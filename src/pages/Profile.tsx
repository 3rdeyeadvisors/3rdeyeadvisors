import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSingleFoundingMemberStatus } from "@/hooks/useFoundingMemberStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { FoundingMemberBadge } from "@/components/community/FoundingMemberBadge";
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Trophy,
  BookOpen,
  Brain,
  TrendingUp,
  Shield,
  Settings,
  Camera,
  Upload,
  Loader2,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Clock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  quizzesPassed: number;
  averageScore: number;
  totalLearningTime: number;
  joinDate: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { refetch: refetchOwnProfile } = useProfile();
  const { userId: viewUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasAccess, subscription } = useSubscription();
  
  // Determine if viewing own profile or someone else's
  const isOwnProfile = !viewUserId || viewUserId === user?.id;
  const targetUserId = viewUserId || user?.id;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courseNotes, setCourseNotes] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    quizzesPassed: 0,
    averageScore: 0,
    totalLearningTime: 0,
    joinDate: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    avatar_url: ""
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isFoundingMember } = useSingleFoundingMemberStatus(targetUserId);

  // Redirect if not authenticated and viewing own profile
  useEffect(() => {
    if (!loading && !user && isOwnProfile) {
      navigate("/auth");
    }
  }, [user, loading, navigate, isOwnProfile]);

  // Load user profile and stats
  useEffect(() => {
    if (targetUserId) {
      loadProfile();
      // Only load stats for own profile
      if (isOwnProfile && user) {
        loadUserStats();
        loadCourseNotes();
      }
    }
  }, [targetUserId, user, isOwnProfile, loadProfile, loadUserStats, loadCourseNotes]);

  const loadProfile = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setEditForm({
          display_name: data.display_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || ""
        });
      } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [targetUserId, user, createProfile]);

  const createProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          bio: null,
          avatar_url: null
        }])
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        display_name: data.display_name || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || ""
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [user]);

  const loadCourseNotes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', 'module');

      if (error) throw error;

      const notes = data
        ?.filter(item => item.metadata && (item.metadata as any).notes)
        .map(item => ({
          moduleId: item.content_id,
          moduleTitle: (item.metadata as any).moduleTitle || 'Unknown Module',
          notes: (item.metadata as any).notes,
          lastUpdated: (item.metadata as any).lastUpdated || item.updated_at || item.last_seen,
          courseId: (item.metadata as any).courseId
        }))
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

      setCourseNotes(notes || []);
    } catch (error) {
      console.error('Error loading course notes:', error);
    }
  }, [user]);

  const loadUserStats = useCallback(async () => {
    if (!user) return;

    try {
      // Load course progress
      const { data: courseProgress, error: courseError } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (courseError) throw courseError;

      // Load quiz attempts
      const { data: quizAttempts, error: quizError } = await supabase
        .from('quiz_attempts')
        .select('score, passed')
        .eq('user_id', user.id);

      if (quizError) throw quizError;

      const coursesEnrolled = courseProgress?.length || 0;
      const coursesCompleted = courseProgress?.filter(p => p.completion_percentage === 100).length || 0;
      const quizzesPassed = quizAttempts?.filter(q => q.passed).length || 0;
      const averageScore = quizAttempts?.length 
        ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
        : 0;

      // Calculate actual learning time from course progress
      // Sum up the estimated time for completed courses
      let totalLearningMinutes = 0;
      
      // Import courseContent to get actual course durations
      const { courseContent } = await import('@/data/courseContent');
      
      courseProgress?.forEach(progress => {
        if (progress.completion_percentage === 100) {
          const course = courseContent.find(c => c.id === progress.course_id);
          if (course) {
            // Sum up all module durations for completed courses
            totalLearningMinutes += course.modules.reduce((sum, module) => sum + module.duration, 0);
          }
        } else if (progress.completion_percentage && progress.completion_percentage > 0) {
          // For partially completed courses, estimate proportionally
          const course = courseContent.find(c => c.id === progress.course_id);
          if (course) {
            const totalCourseDuration = course.modules.reduce((sum, module) => sum + module.duration, 0);
            totalLearningMinutes += Math.round(totalCourseDuration * (progress.completion_percentage / 100));
          }
        }
      });

      setUserStats({
        coursesEnrolled,
        coursesCompleted,
        quizzesPassed,
        averageScore,
        totalLearningTime: totalLearningMinutes,
        joinDate: user.created_at
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, [user]);

  // Compress image before upload for faster uploads and smaller storage
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Max dimension for avatars (800px is plenty)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, WebP, or GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max before compression)
    if (file.size > 10485760) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], `avatar.jpg`, { type: 'image/jpeg' });

      // Delete old avatar if it exists and is from our storage
      if (profile?.avatar_url && profile.avatar_url.includes('supabase.co/storage')) {
        const oldPath = profile.avatar_url.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload compressed avatar
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Handle specific storage errors
        if (uploadError.message?.includes('payload too large') || uploadError.message?.includes('size')) {
          throw new Error('Image is too large. Please try a smaller image.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      setEditForm(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try a smaller image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Call edge function to handle deletion of user data and Auth account
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast({
        title: "Account deleted",
        description: "Your account and data have been permanently removed.",
      });
      navigate("/");
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: error.message || "An error occurred while deleting your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name || null,
          bio: editForm.bio || null,
          avatar_url: editForm.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      
      // Update the global profile state if it's the current user
      if (isOwnProfile) {
        refetchOwnProfile();
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (userStats.coursesCompleted >= 1) {
      achievements.push({
        title: "First Course Complete",
        description: "Completed your first course",
        icon: Trophy,
        color: "text-yellow-600"
      });
    }
    
    if (userStats.quizzesPassed >= 5) {
      achievements.push({
        title: "Quiz Master",
        description: "Passed 5 quizzes",
        icon: Brain,
        color: "text-purple-600"
      });
    }
    
    if (userStats.averageScore >= 90) {
      achievements.push({
        title: "High Achiever",
        description: "Average quiz score above 90%",
        icon: TrendingUp,
        color: "text-green-600"
      });
    }
    
    if (userStats.coursesCompleted >= 4) {
      achievements.push({
        title: "DeFi Master",
        description: "Completed all courses",
        icon: Shield,
        color: "text-blue-600"
      });
    }

    return achievements;
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/50">Loading profile...</p>
        </div>
      </div>
    );
  }

  // For viewing own profile, require authentication
  if (isOwnProfile && !user) {
    return null;
  }

  // For viewing other profiles, allow even if not logged in but profile must exist
  if (!isOwnProfile && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-white/50 mb-4">This user doesn't have a public profile.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const achievements = getAchievements();

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="min-h-screen bg-transparent py-24 w-full overflow-x-hidden relative">
      {/* Nebula Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl w-full relative z-10">
        {/* Back button for viewing other profiles */}
        {!isOwnProfile && (
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-8 font-body text-white/40 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {/* Profile Header */}
        <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl overflow-hidden w-full">
          <CardContent className="p-4 sm:p-8 md:p-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-10">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-consciousness text-violet-400">
                      {(profile?.display_name || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-violet-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  <div className="flex-1 w-full">
                    {isEditing && isOwnProfile ? (
                      <div className="space-y-6">
                        <div>
                          <Label className="font-body text-xs uppercase tracking-widest text-white/40 mb-2 block" htmlFor="display_name">Display Name</Label>
                          <input
                            id="display_name"
                            value={editForm.display_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                            className="font-body text-base bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors w-full"
                            placeholder="Your display name"
                          />
                        </div>
                        <div>
                          <Label className="font-body text-xs uppercase tracking-widest text-white/40 mb-2 block" htmlFor="bio">Bio</Label>
                          <textarea
                            id="bio"
                            value={editForm.bio}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            className="font-body text-base bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors w-full resize-none"
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="font-consciousness text-xl font-bold text-white mb-2 flex items-center gap-3 justify-center md:justify-start">
                          {profile?.display_name || (isOwnProfile ? user?.email?.split('@')[0] : 'User')}
                          {isFoundingMember && <FoundingMemberBadge className="w-5 h-5" />}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                          {isOwnProfile && user && (
                            <div className="font-body text-sm text-white/40">
                              {user.email}
                            </div>
                          )}
                          {isOwnProfile && (
                            <Badge className={`font-body text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${hasAccess ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-white/40 border-white/15'}`}>
                              {hasAccess ? (subscription?.plan === 'annual' ? 'Annual Plan' : 'Monthly Plan') : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        {profile?.bio && (
                          <p className="font-body text-sm text-white/60 leading-relaxed mb-6 max-w-xl">{profile.bio}</p>
                        )}
                        {isOwnProfile && user && (
                          <div className="font-body text-sm text-white/40">
                            Member since {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Edit Controls - only show for own profile */}
                  {isOwnProfile && (
                    <div className="flex gap-3 justify-center sm:self-start">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-6 py-2 transition-all h-auto"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "..." : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({
                                display_name: profile?.display_name || "",
                                bio: profile?.bio || "",
                                avatar_url: profile?.avatar_url || ""
                              });
                            }}
                            className="font-body border-white/10 text-white hover:bg-white/5 rounded-xl px-6 py-2 transition-all h-auto"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="font-body border-white/10 text-white hover:bg-white/5 rounded-xl px-6 py-2 transition-all h-auto"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview - only show for own profile */}
        {isOwnProfile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: BookOpen, value: userStats.coursesEnrolled, label: 'Enrolled', color: 'text-violet-400' },
              { icon: Trophy, value: userStats.coursesCompleted, label: 'Completed', color: 'text-emerald-400' },
              { icon: Brain, value: userStats.quizzesPassed, label: 'Passed', color: 'text-violet-400' },
              { icon: TrendingUp, value: `${userStats.averageScore}%`, label: 'Avg Score', color: 'text-blue-400' }
            ].map((stat, i) => (
              <Card key={i} className="p-6 bg-white/3 border border-white/8 rounded-2xl text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className="font-consciousness text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="font-body text-xs uppercase tracking-widest text-white/40">{stat.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Achievements - only show for own profile */}
        {isOwnProfile && (
          <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl p-4 sm:p-6 w-full">
            <CardHeader className="text-center p-0 mb-8">
              <CardTitle className="font-consciousness text-base font-bold text-white mb-2">
                Achievements
              </CardTitle>
              <CardDescription className="font-body text-sm text-white/40">
                Your learning milestones and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-5 bg-white/5 rounded-xl border border-white/8">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                      </div>
                      <div>
                        <h4 className="font-consciousness text-sm font-bold text-white">{achievement.title}</h4>
                        <p className="font-body text-xs text-white/40">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="font-body text-sm text-white/40">Complete courses and quizzes to unlock achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Course Notes - only show for own profile */}
        {isOwnProfile && courseNotes.length > 0 && (
          <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl p-4 sm:p-6 w-full">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="font-consciousness text-base font-bold text-white mb-2">
                Course Notes
              </CardTitle>
              <CardDescription className="font-body text-sm text-white/40">
                Your personal notes tracked during course modules
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-6">
                {courseNotes.map((note, index) => (
                  <div key={index} className="p-6 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-consciousness text-sm font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-violet-400" />
                        {note.moduleTitle}
                      </h4>
                      <div className="font-body text-[10px] uppercase tracking-widest text-white/40">
                        {new Date(note.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="font-body text-sm text-white/60 leading-relaxed italic border-l-2 border-violet-500/30 pl-4 py-1">
                      {note.notes}
                    </p>
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/courses/${note.courseId}/module/${note.moduleId}`)}
                        className="font-body text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 p-0 h-auto"
                      >
                        Go to Module
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - only show for own profile */}
        {isOwnProfile && (
          <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl p-4 sm:p-6 w-full">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="font-consciousness text-base font-bold text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: User, label: 'Go to Dashboard', path: '/dashboard' },
                  { icon: BookOpen, label: 'Browse Courses', path: '/courses' },
                  { icon: Brain, label: 'Tutorials', path: '/tutorials' }
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="font-body text-sm border-white/10 text-white hover:bg-white/5 rounded-xl py-6 h-auto justify-start px-6"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className="w-4 h-4 mr-3 text-violet-400" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone - only show for own profile */}
        {isOwnProfile && (
          <Card className="mt-12 border-red-500/20 bg-red-500/5 rounded-2xl p-4 sm:p-6 w-full">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="font-consciousness text-base font-bold text-red-400 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="font-body text-sm text-white/40">
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-consciousness text-sm font-bold text-white mb-1">Delete Account</h4>
                  <p className="font-body text-xs text-white/40">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="font-body text-xs bg-red-600 hover:bg-red-500 text-white rounded-xl px-6 py-3 transition-all h-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={saving}
                      >
                        {saving ? "Deleting..." : "Permanently Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};

export default Profile;