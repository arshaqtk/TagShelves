
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1f26] flex items-center justify-center px-6 py-12 lg:px-12">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column: Heading and Subtitle */}
        <div className="w-full lg:w-[50%] flex flex-col text-left space-y-4 lg:pr-8">
          <h1 className="text-white text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.1]">
            Welcome to <br />
            Tagshelves.com
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg font-normal max-w-md">
            Retail Promotion & Pricing Management Platform
          </p>
        </div>

        {/* Right Column: Card and Footer Links */}
        <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start justify-center">
          {/* Main Card */}
          <div className="w-full max-w-md bg-[#13171f] border border-zinc-800/60 rounded-2xl p-8 sm:p-10 shadow-2xl">
            {children}
          </div>

          {/* Legal Footer Links (aligned with the card width) */}
          <div className="w-full max-w-md mt-6 flex flex-col items-center gap-1.5 text-xs text-zinc-500">
            <div className="flex justify-center items-center gap-2">
              <a href="#" className="hover:text-zinc-300 transition-colors">
                Privacy Policy
              </a>
              <span className="text-zinc-800">|</span>
              <a href="#" className="hover:text-zinc-300 transition-colors">
                Terms Of Service
              </a>
              <span className="text-zinc-800">|</span>
              <a href="#" className="hover:text-zinc-300 transition-colors">
                Support
              </a>
            </div>
            <div className="text-zinc-600">
              &copy; 2026 ShelvesTag
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
