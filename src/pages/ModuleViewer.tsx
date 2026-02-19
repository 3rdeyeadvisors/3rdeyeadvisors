import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedContentPlayer } from "@/components/course/EnhancedContentPlayer";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { ParticipantTracker } from "@/components/admin/ParticipantTracker";
import { usePresenceTracking } from "@/hooks/usePresenceTracking";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProgress } from "@/components/progress/ProgressProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { getCourseContent } from "@/data/courseContent";
import { ArrowLeft, BookOpen, List, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { OrientationSuggestion } from "@/components/course/OrientationSuggestion";
import OrionChat from "@/components/orion/OrionChat";

const ModuleViewer = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourseProgress, startCourse } = useProgress();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModuleList, setShowModuleList] = useState(false);
  const isMobile = useIsMobile();

  const course = getCourseContent(parseInt(courseId || "0"));
  const currentModuleIndex = course?.modules.findIndex(m => m.id === moduleId) ?? -1;
  const currentModule = course?.modules[currentModuleIndex];

  const progress = getCourseProgress(course?.id || 0);

  // Track presence
  usePresenceTracking({
    contentType: 'module',
    contentId: moduleId || '',
    progressPercentage: progress?.completion_percentage || 0,
    metadata: { 
      courseId: courseId,
      moduleTitle: currentModule?.title,
      courseTitle: course?.title
    }
  });

  useEffect(() => {
    if (!course || currentModuleIndex === -1) {
      navigate("/courses");
    } else if (user && course) {
      startCourse(course.id);
    }
  }, [course, currentModuleIndex, navigate, user, startCourse]);

  if (!course || currentModuleIndex === -1 || !currentModule) {
    return null;
  }
  
  const handleModuleComplete = () => {
    // Content player handles the completion logic
  };

  const handleNext = () => {
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      navigate(`/courses/${courseId}/module/${nextModule.id}`);
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      navigate(`/courses/${courseId}/module/${prevModule.id}`);
    }
  };

  const isModuleCompleted = (moduleIndex: number) => {
    return progress?.completed_modules?.includes(moduleIndex) || false;
  };

  // Show sign-in prompt overlay instead of blocking content view
  const showSignInPrompt = !user;

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-20">
      <OrientationSuggestion />
      <div className="w-full px-3 sm:px-4 md:px-6 text-center sm:text-left">
        {/* Desktop Only Notice for Mobile Users */}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center sm:justify-start">
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${courseId}`)}
              className="font-consciousness text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px] w-full sm:w-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Back to Course</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowModuleList(!showModuleList)}
              className="font-consciousness text-xs sm:text-sm md:text-base min-h-[40px] sm:min-h-[44px] w-full sm:w-auto"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">All Modules</span>
              <span className="sm:hidden">Modules</span>
            </Button>
          </div>

          <div className="text-center md:text-right px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-end">
              <ParticipantTracker contentType="module" contentId={moduleId || ''} />
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-consciousness font-semibold text-foreground line-clamp-1 break-words">
                  {course.title}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground break-words">
                  {course.category === "free" ? "Free Course" : `${course.category} Course`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module List Sidebar */}
        {showModuleList && (
          <Card className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 md:p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-consciousness font-semibold mb-2.5 sm:mb-3 md:mb-4 text-center md:text-left break-words">Course Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {course.modules.map((module, index) => {
                const isCompleted = isModuleCompleted(index);
                const isCurrent = index === currentModuleIndex;
                
                return (
                  <Button
                    key={module.id}
                    variant={isCurrent ? "default" : "outline"}
                    className={`h-auto p-2.5 sm:p-3 transition-all justify-start text-left min-h-[64px] ${
                      isCurrent 
                        ? "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20" 
                        : isCompleted 
                          ? "bg-awareness/10 border-awareness/40 hover:bg-awareness/20" 
                          : "bg-card border-border hover:border-primary/30"
                    }`}
                    onClick={() => {
                      navigate(`/courses/${courseId}/module/${module.id}`);
                      setShowModuleList(false);
                    }}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {/* Status icon */}
                      {isCompleted ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-awareness rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                          <span className="text-foreground text-[10px] sm:text-xs font-bold">✓</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                          <span className="text-[10px] sm:text-xs font-medium">{index + 1}</span>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 pr-1 sm:pr-2">
                        <p className="text-xs sm:text-sm font-medium leading-snug whitespace-normal break-words">{module.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{module.duration} min</p>
                      </div>
                      
                      {/* Play icon */}
                      {isCurrent && <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-1" />}
                    </div>
                  </Button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Sign In Prompt for non-authenticated users */}
        {showSignInPrompt && (
          <Card className="p-6 sm:p-8 text-center bg-awareness/10 border-awareness/30 mb-6">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-awareness mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-consciousness font-bold text-foreground mb-3">
              Sign In to Access Content
            </h2>
            <p className="text-muted-foreground font-consciousness mb-4 text-sm sm:text-base">
              You can preview the module outline below. Sign in to view the full content and track your progress.
            </p>
            <Button
              variant="awareness"
              onClick={() => setShowAuthModal(true)}
              className="font-consciousness"
            >
              Sign In to Continue
            </Button>
          </Card>
        )}

        {/* Enhanced Content Player - Only show for authenticated users */}
        {user ? (
          <EnhancedContentPlayer
            courseId={course.id}
            module={currentModule}
            onComplete={handleModuleComplete}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={currentModuleIndex < course.modules.length - 1}
            hasPrevious={currentModuleIndex > 0}
            currentModuleIndex={currentModuleIndex}
            totalModules={course.modules.length}
            courseTitle={course.title}
            allModules={course.modules}
          />
        ) : (
          <Card className="p-6 bg-muted/30 border-border">
            <h3 className="text-lg font-consciousness font-semibold mb-4">{currentModule.title}</h3>
            <p className="text-muted-foreground mb-4">Duration: {currentModule.duration} minutes</p>
            <div className="p-4 bg-background/50 rounded-lg border border-border text-center">
              <p className="text-muted-foreground text-sm">
                Full content is available after signing in.
              </p>
            </div>
          </Card>
        )}

        {/* Community Features - Only for authenticated users */}
        {user && (
          <div className="mt-6 sm:mt-8 md:mt-12 px-2 sm:px-0">
            <Card className="p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-consciousness font-bold text-center mb-4 sm:mb-6 break-words">
                Community Discussion
              </h2>
              <CommunityTabs 
                courseId={course.id} 
                moduleId={currentModule.id}
              />
            </Card>
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
      {user && <OrionChat />}
    </div>
  );
};

export default ModuleViewer;