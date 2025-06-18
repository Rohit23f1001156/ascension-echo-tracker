
import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import HoverTiltWrapper from './HoverTiltWrapper';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, Star, Zap, TrendingDown } from 'lucide-react';

const WeeklySummary: React.FC = () => {
    const { stats, questLog } = usePlayer();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyLogs = questLog.filter(log => new Date(log.date) >= sevenDaysAgo);

    // Only count positive XP from good habits for weekly summary
    const totalPositiveXpThisWeek = weeklyLogs
        .filter(log => log.type === 'good')
        .reduce((sum, log) => sum + Math.abs(log.xp), 0);
    
    // Calculate damage taken from bad habits
    const totalDamageTaken = weeklyLogs
        .filter(log => log.type === 'bad')
        .reduce((sum, log) => sum + Math.abs(log.xp), 0);
    
    const questCounts = weeklyLogs.reduce((acc, log) => {
        acc[log.title] = (acc[log.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Only show good quests in top quests
    const goodQuestLogs = weeklyLogs.filter(log => log.type === 'good');
    const goodQuestCounts = goodQuestLogs.reduce((acc, log) => {
        acc[log.title] = (acc[log.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topQuests = Object.entries(goodQuestCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3)
        .map(([title]) => title);

    return (
        <HoverTiltWrapper className="system-card max-w-2xl mx-auto">
            <div className="status-card-inner">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center tracking-widest uppercase font-serif">Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary" />
                            <span className="font-semibold">XP Gained (7d)</span>
                            <span className="font-semibold ml-auto text-green-500">+{totalPositiveXpThisWeek}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Flame className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Current Streak</span>
                            <span className="font-semibold ml-auto">{stats.streak} days</span>
                        </div>
                        {totalDamageTaken > 0 && (
                            <div className="flex items-center gap-3">
                                <TrendingDown className="w-5 h-5 text-destructive" />
                                <span className="font-semibold">Damage Taken</span>
                                <span className="font-semibold ml-auto text-destructive">-{totalDamageTaken}</span>
                            </div>
                        )}
                    </div>
                    <div className="my-6 border-t border-primary/20"></div>
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Star className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">Top Good Habits (7d)</h4>
                        </div>
                        {topQuests.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {topQuests.map((title, index) => (
                                    <li key={index} className="flex items-center justify-between">
                                        <span>{title}</span>
                                        <span className="text-green-500 font-semibold">×{goodQuestCounts[title]}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">No good habits completed this week. Let's get to it!</p>
                        )}
                    </div>
                </CardContent>
            </div>
        </HoverTiltWrapper>
    );
};

export default WeeklySummary;
