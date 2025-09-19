import { BottomNavBar } from '@/components/BottomNavBar';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNavBar />
    </div>
  );
}
