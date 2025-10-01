
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUserData } from "@/hooks/use-user-data";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading } = useUserData();

  const loading = authLoading || userLoading;

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (userData?.role === 'admin') {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [router, user, loading, userData]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-4 text-center">
      <div className="flex-grow flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="relative">
          <div
            className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-full flex items-center justify-center
              shadow-[0_0_20px_theme(colors.primary),_0_0_40px_theme(colors.primary)]"
          >
             <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-20 h-20 md:w-24 md:h-24 text-primary"
            >
               <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M10.5 15.5H14s1.5 0 1.5-1.5-1.5-1.5-1.5-1.5H10.5V10h4" />
                <path d="M12 8.5V7" />
                <path d="M12 17v-1.5" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tighter">hasmi</h1>
          <p className="text-xl md:text-2xl text-foreground/80 tracking-wide">coin mining</p>
        </div>
      </div>
    </div>
  );
}
