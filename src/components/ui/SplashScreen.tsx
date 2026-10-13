import logo from '@/assets/Logo_Vaiven1.webp';
import { APP_VERSION } from '@/lib/version';

export function SplashScreen() {
  return (
    <div className="h-screen w-full flex flex-col bg-secundario relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center pb-12">
        <img 
          src={logo} 
          alt="VaiVen" 
          className="w-48 brightness-0 invert"
        />
        <p className="text-white/90 text-sm font-medium mt-6">
          Tu red de donaciones con match por IA
        </p>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center">
        <div className="w-9 h-9 rounded-full border-[4px] border-white/90 border-t-primario animate-spin" />
        <p className="text-white/60 tracking-widest text-[10px] mt-4">
          {APP_VERSION}
        </p>
      </div>
    </div>
  );
}
