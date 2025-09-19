import React from 'react';

const AppLogo = () => (
    <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
            <div
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center
                shadow-[0_0_15px_theme(colors.primary),_0_0_30px_theme(colors.primary)]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 text-primary"
                >
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                    <path d="M10.5 15.5H14s1.5 0 1.5-1.5-1.5-1.5-1.5-1.5H10.5V10h4" />
                    <path d="M12 8.5V7" />
                    <path d="M12 17v-1.5" />
                </svg>
            </div>
        </div>
        <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tighter">hasmi</h1>
            <p className="text-lg text-foreground/80 tracking-wide">coin mining</p>
        </div>
    </div>
);


export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
            <AppLogo />
        </div>
        {children}
      </div>
    </div>
  );
}
