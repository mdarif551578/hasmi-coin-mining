import { MiningSection } from '@/components/dashboard/MiningSection';
import { TokenLaunchCountdown } from '@/components/dashboard/TokenLaunchCountdown';

export default function MiningPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <MiningSection />
      <TokenLaunchCountdown />
    </div>
  );
}
