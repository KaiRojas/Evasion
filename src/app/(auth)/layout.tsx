export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06040A] text-white antialiased overflow-hidden">
      {/* Logo Header */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <img
          src="/images/evasion-logo.png"
          alt="EVASION"
          className="h-14 w-auto mb-2"
        />
        <p className="text-[#F5F5F4] text-xs font-medium opacity-70 tracking-[0.3em] uppercase">
          Drive the dream
        </p>
      </div>

      <div className="px-6">
        {children}
      </div>
    </div>
  );
}
