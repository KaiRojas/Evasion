import { Car } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-orange-700 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Evasion</span>
        </Link>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Join the Road Community
          </h1>
          <p className="text-orange-100 text-lg">
            Connect with fellow enthusiasts, discover amazing routes, 
            and experience driving like never before.
          </p>
        </div>
        
        <p className="text-orange-200 text-sm">
          © 2026 Evasion. Drive together, explore more.
        </p>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Evasion</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
