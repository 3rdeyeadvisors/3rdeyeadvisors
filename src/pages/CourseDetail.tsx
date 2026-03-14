import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useProgress } from "@/components/progress/ProgressProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Grid3X3, Star, Lock } from "lucide-react";
import PageHero from "@/components/PageHero";
import CourseProgressBar from "@/components/course/CourseProgressBar";
import { getCourseContent } from "@/data/courseContent";
import { EnhancedModuleNavigation } from "@/components/course/EnhancedModuleNavigation";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { ExpandableText } from "@/components/ui/expandable-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { ParticipantTracker } from "@/components/admin/ParticipantTracker";
import { usePresenceTracking } from "@/hooks/usePresenceTracking";
import { ANNUAL_BENEFITS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { updateModuleProgress, getCourseProgress } = useProgress();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEnhancedNav, setShowEnhancedNav] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const isPremiumMember = 
    subscription?.plan === 'annual' || 
    subscription?.isFounder ||
    subscription?.isAdmin ||
    subscription?.isGrandfathered;

  const course = getCourseContent(parseInt(courseId || "0"));
  const progress = getCourseProgress(parseInt(courseId || "0"));

  // Check if course is in early access and user has access
  const { isEarlyAccess, isLocked, releaseDate } = useMemo(() => {
    if (!course?.early_access_date) {
      return { isEarlyAccess: false, isLocked: false, releaseDate: null };
    }
    
    const now = new Date();
    const earlyAccessDate = new Date(course.early_access_date);
    const publicReleaseDate = course.public_release_date 
      ? new Date(course.public_release_date)
      : new Date(earlyAccessDate.getTime() + (ANNUAL_BENEFITS.earlyAccessDays * 24 * 60 * 60 * 1000));
    
    if (now < earlyAccessDate) {
      return { isEarlyAccess: false, isLocked: true, releaseDate: earlyAccessDate };
    }
    
    if (now >= earlyAccessDate && now < publicReleaseDate) {
      return {
        isEarlyAccess: true,
        isLocked: !isPremiumMember,
        releaseDate: publicReleaseDate
      };
    }
    
    return { isEarlyAccess: false, isLocked: false, releaseDate: null };
  }, [course, isPremiumMember]);

  // Track presence for admins
  usePresenceTracking({
    contentType: 'course',
    contentId: courseId || '0',
    progressPercentage: progress?.completion_percentage || 0,
    metadata: { courseTitle: course?.title }
  });

  useEffect(() => {
    if (!course) {
      navigate("/courses");
    }
  }, [course, navigate]);

  if (!course) {
    return null;
  }

  const handleModuleToggle = async (moduleIndex: number) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await updateModuleProgress(course!.id, moduleIndex);
      toast({
        title: "Progress Updated",
        description: "Module completion status has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isModuleCompleted = (moduleIndex: number) => {
    return progress?.completed_modules?.includes(moduleIndex) || false;
  };

  return (
    <>
      <SEO 
        title={`${course.title}: DeFi Course`}
        description={course.description}
        keywords={`DeFi course, ${course.title.toLowerCase()}, decentralized finance, cryptocurrency education, blockchain learning, free course`}
        url={`https://www.sentineldefi.online/courses/${courseId}`}
        schema={{
          type: 'Course',
          data: {
            offers: {
              price: "0",
              priceCurrency: "USD"
            },
            hasCourseInstance: true,
            coursePrerequisites: course.difficulty === 'Beginner' ? 'No prior experience required' : 'Basic understanding of cryptocurrency recommended',
            educationalLevel: course.difficulty,
            teaches: course.modules?.map(module => module.title) || [],
            timeRequired: course.estimatedTime,
            courseCode: `DEFI-${courseId}`,
            numberOfCredits: course.modules?.length || 5
          }
        }}
        faq={[
          {
            question: `What will I learn in ${course.title}?`,
            answer: `${course.description} This course covers ${course.modules?.length || 5} comprehensive modules designed to take you from ${course.difficulty.toLowerCase()} level to confident understanding.`
          },
          {
            question: "How long does this course take to complete?",
            answer: `This course is estimated to take ${course.estimatedTime}. You can learn at your own pace with lifetime access to all materials.`
          },
          {
            question: "Is this course completely free?",
            answer: "Yes, this course is completely free with no hidden costs. Sign up to track your progress and earn completion badges."
          }
        ]}
      />
      <div className="min-h-screen bg-transparent relative">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Course"
          title={course.title}
          subtitle={course.description}
        />

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-6 pb-8 text-center relative z-10">
          <div>
            <p className="font-consciousness text-lg font-bold text-white">{course.difficulty}</p>
            <p className="font-body text-xs uppercase tracking-widest text-white/40">Difficulty</p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div>
            <p className="font-consciousness text-lg font-bold text-white">{course.modules?.length || 0}</p>
            <p className="font-body text-xs uppercase tracking-widest text-white/40">Modules</p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div>
            <p className="font-consciousness text-lg font-bold text-white">{course.estimatedTime || '—'}</p>
            <p className="font-body text-xs uppercase tracking-widest text-white/40">Duration</p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* Start Learning Button - Handled with locking logic */}
          {user && (
            <div className="mb-8 flex flex-col items-center gap-4">
              <Button
                onClick={() => {
                  if (isLocked) {
                    navigate("/subscription");
                    return;
                  }
                  navigate(`/courses/${courseId}/module/${course.modules[0]?.id}`);
                }}
                className={`font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-4 text-base font-semibold transition-all shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40 hover:scale-105 w-full sm:w-auto min-h-[52px] ${
                  isLocked ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    <span>Locked (Annual Only)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="break-words">{progress?.completion_percentage ? "Continue Learning" : "Start Learning"}</span>
                  </>
                )}
              </Button>

              {isLocked && releaseDate && (
                <div className="flex items-center gap-2 text-awareness text-sm font-consciousness animate-pulse">
                  <Clock className="w-4 h-4" />
                  <span>
                    Public Release in {Math.ceil((releaseDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="mb-8">
              <CourseProgressBar
                completed={progress?.completed_modules?.length || 0}
                total={course.modules?.length || 0}
              />
            </div>
          )}

          {!user && (
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-awareness/10 border-awareness/30 mx-2 sm:mx-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
                <div className="flex-1">
                  <h3 className="font-consciousness font-semibold text-foreground mb-2 text-sm sm:text-base break-words">
                    Track Your Progress
                  </h3>
                  <p className="text-white/50 font-consciousness text-xs sm:text-sm break-words leading-relaxed">
                    Sign in to save your progress and earn completion badges.
                  </p>
                </div>
                <Button
                  variant="awareness"
                  onClick={() => setShowAuthModal(true)}
                  className="font-consciousness w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
                >
                  Sign In
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Module List */}
        <div className="px-3 sm:px-4 md:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-consciousness font-semibold text-white">
              Course Modules
            </h2>
            <ParticipantTracker contentType="course" contentId={courseId || '0'} />
          </div>

          <div className="space-y-3">
            {course.modules.map((module, index) => {
              const isCompleted = isModuleCompleted(index);
              
              return (
                <div
                  key={index}
                  className={`group p-4 sm:p-5 border rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isLocked
                      ? "border-white/5 bg-white/1 opacity-50 cursor-not-allowed"
                      : isCompleted
                        ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                        : "border-white/8 bg-white/3 hover:border-violet-500/20"
                  }`}
                  onClick={() => {
                    if (isLocked) {
                      toast({
                        title: "Early Access Only",
                        description: "Upgrade to Annual to unlock this content now, or wait for the public release.",
                      });
                      return;
                    }
                    navigate(`/courses/${courseId}/module/${module.id}`);
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-white/40" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <p className="font-body text-xs uppercase tracking-widest text-white/40">
                          {String(index + 1).padStart(2, '0')}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-consciousness text-sm sm:text-base font-semibold text-white truncate">
                        {module.title}
                      </h3>
                      <p className="font-body text-xs text-white/40 uppercase tracking-wider mt-0.5">
                        {module.duration} min • {
                          module.type === 'text' ? 'Reading' :
                          module.type === 'video' ? 'Video' :
                          module.type === 'interactive' ? 'Interactive' :
                          module.type
                        }
                      </p>
                    </div>
                  </div>
                  {!isLocked && (
                    <Play className="w-4 h-4 text-white/40 group-hover:text-violet-400 transition-colors shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Complete Badge */}
        {user && progress?.completion_percentage === 100 && (
          <Card className="p-6 mt-8 bg-primary/10 border-primary/30 text-center">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-consciousness font-semibold text-primary mb-2">
              Course Complete! 🎉
            </h3>
            <p className="text-white/50 font-consciousness">
              Congratulations on completing this course. You've taken an important step in your DeFi journey.
            </p>
          </Card>
        )}

        {/* Community Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-consciousness font-semibold text-foreground mb-6">
            Community
          </h2>
          <CommunityTabs courseId={course.id} />
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default CourseDetail;