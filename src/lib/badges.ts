import { Award, BookOpen, Brain, CheckCircle, Crown, Flame, MessageSquare, Star, Trophy, Zap } from "lucide-react";

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: typeof Award;
  color: string;
  bgColor: string;
}

// Badge definitions
export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  first_steps: {
    type: 'first_steps',
    name: 'First Steps',
    description: 'Started your first course',
    icon: BookOpen,
    color: 'text-awareness',
    bgColor: 'bg-awareness/20',
  },
  course_graduate: {
    type: 'course_graduate',
    name: 'Course Graduate',
    description: 'Completed a full course',
    icon: Trophy,
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  quiz_master: {
    type: 'quiz_master',
    name: 'Quiz Master',
    description: 'Passed 5 quizzes',
    icon: Brain,
    color: 'text-accent',
    bgColor: 'bg-accent/20',
  },
  perfectionist: {
    type: 'perfectionist',
    name: 'Perfectionist',
    description: 'Got 100% on a quiz',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
  scholar: {
    type: 'scholar',
    name: 'Scholar',
    description: 'Completed 3 courses',
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
  },
  streak_3: {
    type: 'streak_3',
    name: 'On Fire',
    description: '3-day login streak',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
  },
  streak_7: {
    type: 'streak_7',
    name: 'Week Warrior',
    description: '7-day login streak',
    icon: Zap,
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
  },
  contributor: {
    type: 'contributor',
    name: 'Community Voice',
    description: 'Posted your first comment',
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
  },
  defi_master: {
    type: 'defi_master',
    name: 'DeFi Master',
    description: 'Completed all courses',
    icon: Award,
    color: 'text-awareness',
    bgColor: 'bg-awareness/20',
  },
  early_bird: {
    type: 'early_bird',
    name: 'Early Bird',
    description: 'Joined during early access',
    icon: CheckCircle,
    color: 'text-awareness',
    bgColor: 'bg-awareness/20',
  },
  final_exam_master: {
    type: 'final_exam_master',
    name: 'Exam Master',
    description: 'Passed a 33-question final exam',
    icon: Award,
    color: 'text-primary-glow',
    bgColor: 'bg-primary/20',
  },
  course_mastery: {
    type: 'course_mastery',
    name: 'Course Mastery',
    description: 'Got 100% on a final exam',
    icon: Star,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
  },
  cognitive_initiate: {
    type: 'cognitive_initiate',
    name: 'Cognitive Initiate',
    description: 'Started your first mini-game',
    icon: Brain,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
  },
  memory_master: {
    type: 'memory_master',
    name: 'Memory Master',
    description: 'Reached a high level in Memory Match',
    icon: Star,
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
  },
  reflex_pro: {
    type: 'reflex_pro',
    name: 'Reflex Pro',
    description: 'Achieved sub-250ms reaction time',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
  },
  iq_certified: {
    type: 'iq_certified',
    name: 'IQ Certified',
    description: 'Completed the cognitive IQ assessment',
    icon: Award,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
  },
  brain_power_max: {
    type: 'brain_power_max',
    name: 'Maximum Potential',
    description: 'Reached the daily point cap for cognitive training',
    icon: Crown,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
  },
};

export type BadgeType = keyof typeof BADGE_DEFINITIONS;

// Get badge definition by type
export const getBadgeDefinition = (badgeType: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS[badgeType];
};

// Get all badge definitions
export const getAllBadges = (): BadgeDefinition[] => {
  return Object.values(BADGE_DEFINITIONS);
};
