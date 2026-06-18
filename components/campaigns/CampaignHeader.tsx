import Link from "next/link";

interface CampaignHeaderProps {
  userEmail: string;
}

export default function CampaignHeader({ userEmail }: CampaignHeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800/80 bg-[#0b0e13] px-4 sm:px-6">
      <div className="flex items-center gap-3 text-[11px]">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300">
          Back
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-1.5 w-4 rounded-full bg-emerald-400" />
          campaigns
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-zinc-500">
        <button type="button" className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-zinc-300">
          Shop
        </button>
        <span className="hidden sm:inline">{userEmail}</span>
        <span className="h-6 w-6 rounded-full border border-zinc-700 bg-zinc-900" />
      </div>
    </header>
  );
}
