import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProgress } from '@/components/progress/ProgressProvider';
import { LucideIcon, Star, Lock, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  modules: string[];
  icon: LucideIcon;
  isEarlyAccess?: boolean;
  isLocked?: boolean;
  public_release_date?: string | null;
}

interface CourseCardProps {
  course: Course;
  index: number;
  onStartCourse: (courseId: number) => void;
  onAuthRequired: () => void;
}

export const CourseCard = ({ course, index, onStartCourse, onAuthRequired }: CourseCardProps) => {
  const { user } = useAuth();
  const { courseProgress, getCourseProgress, isCourseCompleted } = useProgress();
  const isMobile = useIsMobile();

  const userCourseProgress = user ? getCourseProgress(course.id) : null;
  const isCompleted = user ? isCourseCompleted(course.id) : false;
  const isStarted = !!userCourseProgress;

  const handleStartCourse = () => {
    if (course.isLocked) {
      onAuthRequired();
      return;
    }
    onStartCourse(course.id);
  };

  const getButtonText = () => {
    if (course.isLocked) return "Upgrade to Annual";
    if (!user) return "Start Learning";
    if (isCompleted) return "Course Completed";
    if (isStarted) return "Continue Learning";
    return "Start Learning";
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const diffTime = date.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "Intermediate": return "text-violet-400 border-violet-500/30 bg-violet-500/10";
      case "Advanced": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      default: return "text-white/40 border-white/15 bg-white/5";
    }
  };

  return (
    <Card 
      className="relative bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group flex flex-col h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-300">
            <course.icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            {course.isEarlyAccess && (
              <Badge className="bg-violet-600 text-white font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border-none">
                Early Access
              </Badge>
            )}
            <Badge className={`font-body text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${getDifficultyColor(course.difficulty || "Beginner")}`}>
              {course.difficulty || "Beginner"}
            </Badge>
          </div>
        </div>

        <h3 className="font-consciousness text-lg font-bold text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 font-body text-[10px] uppercase tracking-widest text-white/30">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Star className="w-3 h-3 fill-current" />
            4.8
          </span>
        </div>
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <p className="font-body text-sm text-white/50 leading-relaxed mb-8 line-clamp-3">
          {course.description}
        </p>

        <div className="space-y-6 mt-auto">
          {user && !course.isLocked && (
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex justify-between font-body text-[10px] uppercase tracking-widest text-white/40">
                <span>Progress</span>
                <span className="text-white">Active</span>
              </div>
              <ProgressBar courseId={course.id} className="h-1.5" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4">
        <Button
          className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all"
          onClick={handleStartCourse}
          disabled={course.isLocked}
        >
          {course.isLocked ? (
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Locked
            </span>
          ) : isCompleted ? (
            "Review Course"
          ) : (
            <span className="flex items-center">
              {isStarted ? "Continue Learning" : "Start Course"}
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
};