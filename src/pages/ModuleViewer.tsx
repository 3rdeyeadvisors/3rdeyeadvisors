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
import { ArrowLeft, BookOpen, List, Play, CheckCircle, Lock } from "lucide-react";
import CourseProgressBar from "@/components/course/CourseProgressBar";
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
    <div className="min-h-screen bg-transparent pt-20 pb-12">
      <OrientationSuggestion />

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Left Column (Content) */}
        <div className="w-full lg:w-[65%] space-y-6">
          {/* Content Top Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/courses/${courseId}`)}
                className="font-body text-xs uppercase tracking-widest text-white/40 hover:text-white p-0 h-auto"
              >
                <ArrowLeft className="w-3 h-3 mr-2" />
                Back to Course
              </Button>
              <ParticipantTracker contentType="module" contentId={moduleId || ''} />
            </div>

            <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-2">
              {course.title}
            </p>
            <h1 className="font-consciousness text-xl md:text-3xl font-bold text-white mb-4">
              {currentModule.title}
            </h1>
            <p className="font-body text-xs text-white/40 uppercase tracking-widest">
              Module {currentModuleIndex + 1} of {course.modules.length}
            </p>
          </div>

          {/* Sign In Prompt for non-authenticated users */}
          {showSignInPrompt && (
            <Card className="p-8 text-center bg-white/3 border-white/8 rounded-2xl mb-6">
              <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-consciousness font-bold text-white mb-3">
                Sign In to Access Content
              </h2>
              <p className="text-white/50 font-body mb-6 text-sm sm:text-base">
                You can preview the module outline below. Sign in to view the full content and track your progress.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-3 transition-all"
              >
                Sign In to Continue
              </Button>
            </Card>
          )}

          {/* Enhanced Content Player */}
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
            <Card className="p-6 bg-white/3 border-white/8 rounded-2xl">
              <h3 className="text-lg font-consciousness font-semibold text-white mb-4">{currentModule.title}</h3>
              <p className="text-white/40 mb-4">Duration: {currentModule.duration} minutes</p>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-white/50 text-sm font-body">
                  Full content is available after signing in.
                </p>
              </div>
            </Card>
          )}

          {/* Community Features */}
          {user && (
            <div className="mt-12">
              <h2 className="text-xl md:text-2xl font-consciousness font-bold text-white mb-6">
                Community Discussion
              </h2>
              <CommunityTabs
                courseId={course.id}
                moduleId={currentModule.id}
              />
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-24 lg:self-start space-y-6">
          {/* Course Progress Card */}
          {user && (
            <Card className="bg-white/3 border-white/8 rounded-2xl p-6">
              <CourseProgressBar
                completed={progress?.completed_modules?.length || 0}
                total={course.modules?.length || 0}
              />
            </Card>
          )}

          {/* Module List */}
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="font-consciousness text-sm font-bold text-white p-4 border-b border-white/8 flex items-center justify-between">
              <span>Course Modules</span>
              <span className="text-white/40 font-body text-xs">{course.modules.length} total</span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {course.modules.map((module, index) => {
                const isCompleted = isModuleCompleted(index);
                const isCurrent = index === currentModuleIndex;
                
                return (
                  <button
                    key={module.id}
                    className={`w-full flex items-center gap-3 px-4 py-4 border-b border-white/5 last:border-0 transition-all text-left group ${
                      isCurrent 
                        ? "bg-violet-500/10 text-violet-300"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => navigate(`/courses/${courseId}/module/${module.id}`)}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                          isCurrent ? "border-violet-400 text-violet-400" : "border-white/20 text-white/40"
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body text-sm truncate ${isCurrent ? "font-semibold" : ""}`}>
                        {module.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
                        {module.duration} min
                      </p>
                    </div>
                    {isCurrent && <Play className="w-3 h-3 text-violet-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        {user && <OrionChat />}
      </div>
  );
};

export default ModuleViewer;