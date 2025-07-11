
import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import HoverTiltWrapper from './HoverTiltWrapper';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, Star, Zap, Shield } from 'lucide-react';

const WeeklySummary: React.FC = () => {
    const { stats, questLog } = usePlayer();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyLogs = questLog.filter(log => new Date(log.date) >= sevenDaysAgo);

    // Only count XP from good habits for weekly summary
    const totalGoodXpThisWeek = weeklyLogs
        .filter(log => log.type === 'good')
        .reduce((sum, log) => sum + Math.max(0, log.xp), 0);
    
    const totalBadXpThisWeek = weeklyLogs
        .filter(log => log.type === 'bad')
        .reduce((sum, log) => sum + Math.abs(log.xp), 0);
    
    const questCounts = weeklyLogs.reduce((acc, log) => {
        acc[log.title] = (acc[log.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topQuests = Object.entries(questCounts)
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
                            <span className="font-semibold">Good XP Gained</span>
                            <span className="font-semibold ml-auto text-green-500">+{totalGoodXpThisWeek}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-destructive" />
                            <span className="font-semibold">Bad XP Damage</span>
                            <span className="font-semibold ml-auto text-red-500">-{totalBadXpThisWeek}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Flame className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Current Streak</span>
                            <span className="font-semibold ml-auto">{stats.streak} days</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Star className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Net Progress</span>
                            <span className={`font-semibold ml-auto ${totalGoodXpThisWeek - totalBadXpThisWeek >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {totalGoodXpThisWeek - totalBadXpThisWeek >= 0 ? '+' : ''}{totalGoodXpThisWeek - totalBadXpThisWeek}
                            </span>
                        </div>
                    </div>
                    <div className="my-6 border-t border-primary/20"></div>
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Star className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">Top Activities (7d)</h4>
                        </div>
                        {topQuests.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {topQuests.map((title, index) => <li key={index}>{title}</li>)}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">No quests completed this week. Let's get to it!</p>
                        )}
                    </div>
                </CardContent>
            </div>
        </HoverTiltWrapper>
    );
};

export default WeeklySummary;
