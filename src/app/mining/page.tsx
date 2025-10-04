
import { MiningSection } from '@/components/dashboard/MiningSection';
import { TokenLaunchCountdown } from '@/components/dashboard/TokenLaunchCountdown';

export default function MiningPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mining Center</h1>
      </div>
      <MiningSection />
      <TokenLaunchCountdown />
    </div>
  );
}
