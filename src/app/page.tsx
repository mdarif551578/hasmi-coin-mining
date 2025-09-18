import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-4 text-center">
      <div className="flex-grow flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div
            className="w-40 h-40 bg-primary rounded-full flex items-center justify-center
              shadow-[0_0_20px_theme(colors.primary),_0_0_40px_theme(colors.primary),_0_0_60px_theme(colors.primary)]"
          >
             <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-24 h-24"
            >
                <path d="M11.5 18.5v-13M8.5 8.5l3-3 3 3M8.5 15.5l3 3 3-3" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-6xl font-bold text-white tracking-tighter">hasmi</h1>
          <p className="text-2xl text-white/80 tracking-wide">coin mining</p>
        </div>
      </div>

      <div className="w-full max-w-md pb-8">
        <Button className="w-full h-14 text-lg font-bold bg-primary/90 hover:bg-primary text-primary-foreground rounded-full shadow-[0_0_15px_-5px_theme(colors.primary)]">
          Start Mining
        </Button>
      </div>
    </div>
  );
}
