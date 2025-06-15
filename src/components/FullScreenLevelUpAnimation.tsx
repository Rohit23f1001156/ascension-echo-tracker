
import React, { useEffect, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';

const FullScreenLevelUpAnimation = () => {
    const { levelUpData } = usePlayer();
    const [show, setShow] = useState(true);

    useEffect(() => {
        // The animation is 3s long in CSS. The component will unmount after that.
        const timer = setTimeout(() => setShow(false), 3000); 
        return () => clearTimeout(timer);
    }, []);
    
    if (!show || !levelUpData) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="text-center text-white animate-fade-in-strong">
                <h1 className="text-8xl md:text-9xl font-black uppercase font-serif tracking-widest text-primary" style={{ textShadow: '0 0 25px hsl(var(--primary)), 0 0 50px hsl(var(--primary))' }}>
                    Level Up
                </h1>
                <p className="text-4xl md:text-5xl mt-4 font-semibold">
                    You are now Level <span className="text-primary">{levelUpData.newLevel}</span>
                </p>
            </div>
            {/* Particle Effect Simulation */}
            {[...Array(30)].map((_, i) => {
                const angle = Math.random() * 360;
                const radius = Math.random() * 400 + 150;
                const tx = Math.cos(angle * (Math.PI / 180)) * radius;
                const ty = Math.sin(angle * (Math.PI / 180)) * radius;
                
                return (
                    <div
                        key={i}
                        className="absolute rounded-full bg-primary"
                        style={{
                            width: `${Math.random() * 8 + 2}px`,
                            height: `${Math.random() * 8 + 2}px`,
                            animation: `particle-effect 3s ${Math.random() * 0.5}s ease-out forwards`,
                            top: '50%',
                            left: '50%',
                            // @ts-ignore
                            '--tx': tx,
                            '--ty': ty,
                        }}
                    />
                )
            })}
        </div>
    );
};

export default FullScreenLevelUpAnimation;
