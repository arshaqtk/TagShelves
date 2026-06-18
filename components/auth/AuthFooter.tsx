import Link from "next/link";

interface AuthFooterProps {
  promptText: string;
  linkText: string;
  linkHref: string;
}

export default function AuthFooter({ promptText, linkText, linkHref }: AuthFooterProps) {
  return (
    <div className="mt-6 text-center">
      {/* Cross-page link */}
      <p className="text-sm text-zinc-500">
        {promptText}{" "}
        <Link
          href={linkHref}
          className="text-emerald-500 font-semibold hover:text-[#34d399] transition-colors"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
