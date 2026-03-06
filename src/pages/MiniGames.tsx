import React, { useState, useEffect } from 'react';
import { usePoints } from '@/hooks/usePoints';
import { useBadges } from '@/hooks/useBadges';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain, Zap, Timer, Award, Activity,
  ChevronLeft, Trophy, Target, BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryMatch } from '@/components/mini-games/MemoryMatch';
import { ReactionTime } from '@/components/mini-games/ReactionTime';
import { PatternSequence } from '@/components/mini-games/PatternSequence';
import { MathSprint } from '@/components/mini-games/MathSprint';
import { IQTest } from '@/components/mini-games/IQTest';
import { CognitiveScience } from '@/components/mini-games/CognitiveScience';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/components/auth/AuthProvider';
import PageHero from '@/components/PageHero';

const DAILY_CAP = 100;

const GAMES = [
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Strengthen short-term memory and visual focus.',
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    component: MemoryMatch,
    category: 'Memory',
    benefit: 'Improves hippocampal function and visual-spatial recall.'
  },
  {
    id: 'reflex',
    title: 'Reaction Test',
    description: 'Improve mental agility and physical reflex speed.',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    component: ReactionTime,
    category: 'Reflexes',
    benefit: 'Sharpens neural transmission speed and motor response.'
  },
  {
    id: 'pattern',
    title: 'Pattern Sequence',
    description: 'Enhance focus and sequence recognition.',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    component: PatternSequence,
    category: 'Focus',
    benefit: 'Trains prefrontal cortex for sequence and pattern recognition.'
  },
  {
    id: 'math',
    title: 'Math Sprint',
    description: 'Fast-paced mental arithmetic for fluid intelligence.',
    icon: Timer,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    component: MathSprint,
    category: 'Agility',
    benefit: 'Enhances fluid intelligence and mental arithmetic speed.'
  },
  {
    id: 'iq',
    title: 'IQ Assessment',
    description: 'Scientifically-inspired cognitive evaluation.',
    icon: BarChart,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    component: IQTest,
    category: 'General IQ',
    benefit: 'Comprehensive evaluation of logical and spatial reasoning.'
  }
];

const MiniGames = () => {
  const { user } = useAuth();
  const { awardPoints, refreshPoints } = usePoints();
  const { awardBadge, hasBadge } = useBadges();
  const { playPointsEarned, playBadgeEarned, playSuccess } = useAchievementSounds();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [dailyMiniGamePoints, setDailyMiniGamePoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchDailyPoints = async () => {
      if (!user) return;

      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .eq('action_type', 'mini_game_win')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const total = data?.reduce((sum, p) => sum + p.points, 0) || 0;
      setDailyMiniGamePoints(total);
      setIsLoading(false);
    };

    fetchDailyPoints();
  }, [user]);

  const handleGameComplete = async (scoreOrIq: number, possibleScore?: number) => {
    if (!user) return;

    // Award cognitive initiate badge on first play
    if (!hasBadge('cognitive_initiate')) {
      await awardBadge('cognitive_initiate');
      playBadgeEarned();
    }

    if (activeGame === 'iq') {
      const iq = scoreOrIq;
      const score = possibleScore || 0;
      // For IQ test, we use a fixed point value but track the score in metadata
      await awardPoints('iq_test_completed', 'iq_assessment', { iq, score });
      if (!hasBadge('iq_certified')) {
        await awardBadge('iq_certified');
      }
      playSuccess();
    } else {
      const score = scoreOrIq;
      // Handle daily cap
      if (dailyMiniGamePoints < DAILY_CAP) {
        const pointsToAward = Math.min(score, DAILY_CAP - dailyMiniGamePoints);
        if (pointsToAward > 0) {
          // Pass performance-based score as pointsOverride
          await awardPoints('mini_game_win', `game_${activeGame}`, { score }, pointsToAward);
          setDailyMiniGamePoints(prev => prev + pointsToAward);
          playPointsEarned();

          if (dailyMiniGamePoints + pointsToAward >= DAILY_CAP && !hasBadge('brain_power_max')) {
            await awardBadge('brain_power_max');
            playBadgeEarned();
          }
        }
      }
    }

    refreshPoints();
  };

  const ActiveGameComponent = GAMES.find(g => g.id === activeGame)?.component;

  return (
    <>
      <SEO
        title="DeFi Brain Games | Sentinel DeFi"
        description="Sharpen your DeFi knowledge with interactive brain games and cognitive challenges. Learn crypto concepts through play."
        keywords="DeFi games, crypto learning games, blockchain education games, DeFi quiz games"
        url="https://www.sentineldefi.online/mini-games"
      />

    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Nebula Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
      <div className="max-w-6xl mx-auto">
        {!activeGame ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <PageHero
              eyebrow="Brain Training"
              title="Sharpen Your Mind"
              subtitle="Cognitive challenges designed to build the pattern recognition and analytical thinking that makes you a better DeFi participant."
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-consciousness font-bold text-white mb-2">Cognitive Lab</h2>
                <p className="text-white/50 font-body max-w-2xl">
                  Scientifically-inspired exercises designed to sharpen your mental edge,
                  increase IQ, and build long-term cognitive resilience.
                </p>
              </div>

              <Card className="p-6 bg-white/3 border-white/8 min-w-[280px] rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-consciousness">Daily Training</span>
                  </div>
                  <span className="text-primary font-bold">{dailyMiniGamePoints}/{DAILY_CAP} pts</span>
                </div>
                <Progress value={(dailyMiniGamePoints / DAILY_CAP) * 100} className="h-2 mb-2" />
                <p className="text-xs text-white/50 text-center">
                  Daily point cap: 100 points. Keep playing for glory!
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <TooltipProvider>
                {GAMES.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group cursor-pointer h-full flex flex-col"
                          onClick={() => setActiveGame(game.id)}
                        >
                          <div className="p-6 flex-1">
                            <div className={`w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                              <game.icon className="w-6 h-6 text-violet-400" />
                            </div>
                            <div className="mb-4">
                              <span className="font-body text-[10px] uppercase tracking-widest text-violet-400 border border-violet-500/30 bg-violet-500/10 px-2 py-1 rounded-md">{game.category}</span>
                              <h3 className="font-consciousness text-lg font-bold text-white mt-4 group-hover:text-violet-300 transition-colors">{game.title}</h3>
                            </div>
                            <p className="font-body text-sm text-white/50 line-clamp-2 mb-6">
                              {game.description}
                            </p>
                          </div>
                          <div className="px-6 pb-6 mt-auto">
                            <Button className="w-full font-body text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 transition-all">
                              Play Game
                            </Button>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs p-4 bg-[#0a0a0a] border-violet-500/30 text-white">
                        <div className="flex items-center gap-2 mb-1 text-violet-400">
                          <Activity className="w-4 h-4" />
                          <span className="font-bold font-consciousness text-xs">Cognitive Benefit</span>
                        </div>
                        <p className="text-xs text-white/60 font-body">
                          {game.benefit}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </TooltipProvider>
            </div>

            <Card className="p-8 border-dashed border-2 border-primary/20 bg-primary/5">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Cognitive Science & Performance</h3>
                  <p className="text-white/50">
                    Regular engagement with these exercises leverages neuroplasticity to improve processing speed,
                    working memory, and problem-solving efficiency. For maximum benefit, train for at least 15 minutes daily.
                  </p>
                </div>
                <Button
                  variant={showAnalytics ? "default" : "outline"}
                  size="lg"
                  className="min-h-[44px]"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  {showAnalytics ? "Hide Analytics" : "View Performance Dashboard"}
                </Button>
              </div>
            </Card>

            <AnimatePresence>
              {showAnalytics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <CognitiveScience />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveGame(null)}
                className="rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div>
                <h2 className="text-3xl font-bold font-consciousness">
                  {GAMES.find(g => g.id === activeGame)?.title}
                </h2>
                <p className="text-white/50">
                  {GAMES.find(g => g.id === activeGame)?.category} training in progress...
                </p>
              </div>
            </div>

            <Card className="p-8 bg-white/3 backdrop-blur-md border-primary/20 overflow-hidden relative min-h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {ActiveGameComponent && (
                  <ActiveGameComponent onComplete={handleGameComplete} />
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </div>
      </div>
    </div>
    </>
  );
};

export default MiniGames;
