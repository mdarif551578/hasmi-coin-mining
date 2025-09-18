"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000); // 3-second delay

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#000957] to-background p-4 text-center">
      <div className="flex-grow flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="relative">
          <div
            className="w-40 h-40 bg-primary/20 rounded-full flex items-center justify-center
              shadow-[0_0_20px_theme(colors.primary),_0_0_40px_theme(colors.primary),_0_0_60px_theme(colors.primary)]"
          >
             <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-24 h-24"
            >
               <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M10.5 15.5H14s1.5 0 1.5-1.5-1.5-1.5-1.5-1.5H10.5V10h4" />
                <path d="M12 8.5V7" />
                <path d="M12 17v-1.5" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-6xl font-bold text-white tracking-tighter">hasmi</h1>
          <p className="text-2xl text-white/80 tracking-wide">coin mining</p>
        </div>
      </div>
    </div>
  );
}
