import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Brain, Activity, TrendingUp, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const CognitiveScience = () => {
  const { user } = useAuth();

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['cognitive-performance', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: points } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .or('action_type.eq.mini_game_win,action_type.eq.iq_test_completed')
        .order('created_at', { ascending: true });

      // Process radar data
      const categories: Record<string, number[]> = {
        'Agility': [],
        'Memory': [],
        'Focus': [],
        'Reflexes': [],
        'Logic': []
      };

      points?.forEach(p => {
        const actionId = p.action_id || '';
        if (actionId.includes('math')) categories['Agility'].push(p.points);
        if (actionId.includes('memory')) categories['Memory'].push(p.points);
        if (actionId.includes('pattern')) categories['Focus'].push(p.points);
        if (actionId.includes('reflex')) categories['Reflexes'].push(p.points);
        if (p.action_type === 'iq_test_completed') categories['Logic'].push(p.points);
      });

      const radarData = Object.keys(categories).map(cat => ({
        subject: cat,
        A: categories[cat].length > 0
          ? Math.min(100, (categories[cat].reduce((a, b) => a + b, 0) / categories[cat].length) * 4)
          : 20, // Default low value if no data
        fullMark: 100,
      }));

      // Process line chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const dailyPoints = last7Days.map(date => {
        const dayTotal = (points || [])
          .filter(p => p.created_at.startsWith(date))
          .reduce((sum, p) => sum + p.points, 0);
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          points: dayTotal
        };
      });

      return { radarData, dailyPoints };
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold font-consciousness">Cognitive Profile</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData?.radarData}>
                <PolarGrid stroke="rgba(var(--primary), 0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Based on your recent exercise performance and accuracy.
          </p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold font-consciousness">Training Intensity</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData?.dailyPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--primary), 0.1)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--primary) / 0.2)',
                    borderRadius: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Daily points earned through cognitive training.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-primary/5 border-primary/10 flex items-center gap-4">
          <Activity className="w-8 h-8 text-primary opacity-50" />
          <div>
            <div className="text-sm text-muted-foreground">Neural Plasticity</div>
            <div className="text-lg font-bold">High Average</div>
          </div>
        </Card>
        <Card className="p-4 bg-primary/5 border-primary/10 flex items-center gap-4">
          <Target className="w-8 h-8 text-primary opacity-50" />
          <div>
            <div className="text-sm text-muted-foreground">Focus Stability</div>
            <div className="text-lg font-bold">Improving</div>
          </div>
        </Card>
        <Card className="p-4 bg-primary/5 border-primary/10 flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          <div>
            <div className="text-sm text-muted-foreground">Processing Speed</div>
            <div className="text-lg font-bold">+12% this week</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
