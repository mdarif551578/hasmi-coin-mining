"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Rocket } from 'lucide-react';

export function TokenLaunchCountdown() {
    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const launchDate = new Date();
        launchDate.setDate(launchDate.getDate() + 30); // Set launch date 30 days from now

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatUnit = (value: number, label: string) => (
        <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold">{value.toString().padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );

    return (
        <Card className="rounded-2xl w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Token Launch</CardTitle>
                <Rocket className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-center text-muted-foreground mb-4">The official Hasmi Coin will launch in:</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {formatUnit(timeRemaining.days, "Days")}
                    {formatUnit(timeRemaining.hours, "Hours")}
                    {formatUnit(timeRemaining.minutes, "Mins")}
                    {formatUnit(timeRemaining.seconds, "Secs")}
                </div>
            </CardContent>
        </Card>
    );
}
