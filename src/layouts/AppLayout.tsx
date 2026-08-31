import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-superficie">
      <div className="relative mx-auto flex min-h-screen w-full sm:max-w-[390px] flex-col bg-superficie">
        <div className="fixed left-1/2 top-0 z-10 w-full sm:max-w-[390px] -translate-x-1/2">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto pb-[84px] pt-14">
          <Outlet />
        </main>

        <div className="fixed bottom-0 left-1/2 z-10 w-full sm:max-w-[390px] -translate-x-1/2">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
