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
    subscription?.plan === 'founding_33' ||
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
        url={`https://www.the3rdeyeadvisors.com/courses/${courseId}`}
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
      <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/courses")}
          className="mb-8 font-consciousness"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              {isEarlyAccess && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Early Access
                </Badge>
              )}
              <Badge className="bg-awareness/20 text-awareness border-awareness/30 text-xs sm:text-sm">
                Free Course
              </Badge>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-system text-xs sm:text-sm">{course.estimatedTime}</span>
            </div>
          </div>

          {/* Start Learning Button - Handled with locking logic */}
          {user && (
            <div className="mb-4 sm:mb-6 flex flex-col items-center sm:items-start gap-3 px-2 sm:px-0">
              <Button
                onClick={() => {
                  if (isLocked) {
                    navigate("/subscription");
                    return;
                  }
                  navigate(`/courses/${courseId}/module/${course.modules[0]?.id}`);
                }}
                className={`font-consciousness w-full sm:w-auto flex items-center justify-center min-h-[44px] text-sm sm:text-base ${
                  isLocked
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
                size="lg"
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

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-consciousness font-bold text-foreground mb-3 sm:mb-4 break-words leading-tight px-2 sm:px-0">
            {course.title}
          </h1>

          {/* Mobile: Expandable text, Desktop: Full text */}
          <div className="mb-4 sm:mb-6 px-2 sm:px-0">
            <div className="block md:hidden">
              <ExpandableText 
                text={course.description}
                maxLines={3}
                className="text-base sm:text-lg text-muted-foreground font-consciousness leading-relaxed break-words"
                mobileOnly={true}
              />
            </div>
            <p className="hidden md:block text-lg text-muted-foreground font-consciousness leading-relaxed break-words">
              {course.description}
            </p>
          </div>

          {/* Softer notice for mobile users */}
          {isMobile && (
            <div className="text-center py-2.5 sm:py-3 px-3 sm:px-4 mb-3 sm:mb-4 bg-muted/30 rounded-lg border border-border mx-2 sm:mx-0">
              <p className="text-sm text-muted-foreground break-words leading-relaxed">
                Fully usable on mobile. For the best experience, we recommend rotating your device to landscape or using a desktop.
              </p>
            </div>
          )}

          {user && (
            <ProgressBar 
              courseId={course.id} 
              className="mb-6"
            />
          )}

          {!user && (
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-awareness/10 border-awareness/30 mx-2 sm:mx-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
                <div className="flex-1">
                  <h3 className="font-consciousness font-semibold text-foreground mb-2 text-sm sm:text-base break-words">
                    Track Your Progress
                  </h3>
                  <p className="text-muted-foreground font-consciousness text-xs sm:text-sm break-words leading-relaxed">
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

        {/* Module Navigation Toggle */}
        <div className="flex flex-col gap-2.5 sm:gap-3 mb-4 sm:mb-6 px-3 sm:px-4 md:px-6">
          {/* Title and Metrics Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-consciousness font-semibold text-foreground break-words">
              Course Modules
            </h2>
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
              <ParticipantTracker contentType="course" contentId={courseId || '0'} />
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex w-full rounded-lg bg-background/40 border border-border/40 p-1 gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowEnhancedNav(true)}
              className={`flex-1 inline-flex items-center justify-center rounded-md px-2 sm:px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium font-consciousness transition-colors min-h-[44px] ${
                showEnhancedNav
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground bg-transparent'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap break-words">Enhanced View</span>
            </button>
            <button
              onClick={() => setShowEnhancedNav(false)}
              className={`flex-1 inline-flex items-center justify-center rounded-md px-2 sm:px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium font-consciousness transition-colors min-h-[44px] ${
                !showEnhancedNav
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground bg-transparent'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap break-words">Simple View</span>
            </button>
          </div>
        </div>

        {/* Enhanced or Simple Module Navigation */}
        {showEnhancedNav ? (
          <EnhancedModuleNavigation
            courseId={course.id}
            onModuleSelect={(moduleId) => navigate(`/courses/${courseId}/module/${moduleId}`)}
            showProgress={true}
            compact={false}
          />
        ) : (
          <div className="space-y-4">
            {course.modules.map((module, index) => {
              const isCompleted = isModuleCompleted(index);
              
              return (
                <Card
                  key={index}
                  className={`p-6 transition-all duration-300 ${
                    isLocked
                      ? "bg-muted/30 border-border opacity-70 cursor-not-allowed"
                      : isCompleted
                        ? "bg-primary/5 border-primary/30 cursor-pointer"
                        : "bg-card/60 border-border hover:border-primary/40 cursor-pointer"
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
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {user ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => handleModuleToggle(index)}
                            className="mt-1"
                          />
                        </div>
                      ) : (
                        <div className="w-4 h-4 border rounded mt-1 border-border" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-system text-muted-foreground">
                            Module {index + 1}
                          </span>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <h3 className={`font-consciousness font-medium ${
                          isCompleted ? "text-primary" : "text-foreground"
                        }`}>
                          {module.title}
                        </h3>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {module.duration} minutes • {module.type}
                        </p>
                      </div>
                      
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Course Complete Badge */}
        {user && progress?.completion_percentage === 100 && (
          <Card className="p-6 mt-8 bg-primary/10 border-primary/30 text-center">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-consciousness font-semibold text-primary mb-2">
              Course Complete! 🎉
            </h3>
            <p className="text-muted-foreground font-consciousness">
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
      </div>
    </>
  );
};

export default CourseDetail;