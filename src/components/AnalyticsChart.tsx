
import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { usePlayer } from '@/context/PlayerContext';
import { eachDayOfInterval, subDays, format, parseISO, isSameDay } from 'date-fns';

const chartConfig = {
  quests: {
    label: "Quests Completed",
    color: "#9333ea", // purple-600
  },
} satisfies ChartConfig;

const AnalyticsChart = () => {
    const { questLog } = usePlayer();

    const chartData = React.useMemo(() => {
        const last7Days = eachDayOfInterval({
            start: subDays(new Date(), 6),
            end: new Date(),
        });

        return last7Days.map(day => {
            const questsOnDay = questLog.filter(log => {
                if (!log.date || typeof log.date !== 'string') {
                    return false;
                }
                try {
                    return isSameDay(parseISO(log.date), day);
                } catch (error) {
                    console.warn('Invalid date format in quest log:', log.date);
                    return false;
                }
            }).length;
            
            return {
                date: format(day, 'EEE'),
                quests: questsOnDay,
            };
        });
    }, [questLog]);

    return (
        <Card className="bg-card/80 border-primary/20">
            <CardHeader>
                <CardTitle>Weekly Momentum</CardTitle>
                <CardDescription>Quests you've completed over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 0,
                            right: 24,
                            top: 10,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#a855f7" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            stroke="#a855f7"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            allowDecimals={false}
                            stroke="#a855f7"
                        />
                        <ChartTooltip
                            cursor={true}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <defs>
                            <linearGradient id="fillQuests" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#9333ea"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#9333ea"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="quests"
                            type="natural"
                            fill="url(#fillQuests)"
                            strokeWidth={2}
                            stroke="#9333ea"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default AnalyticsChart;
