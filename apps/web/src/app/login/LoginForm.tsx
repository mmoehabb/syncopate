"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithGithub } from "./actions";

export function LoginForm({ redirectPath }: { redirectPath?: string }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <div className="flex items-start gap-3 bg-obsidian-night/50 border border-white/5 p-3 rounded mb-2">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 bg-void-grey border-white/20 rounded focus:ring-neon-pulse focus:ring-2 focus:ring-offset-obsidian-night focus:ring-offset-2 appearance-none checked:bg-neon-pulse checked:border-transparent relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[2px] after:w-[4px] after:h-[8px] after:border-solid after:border-obsidian-night after:border-r-2 after:border-b-2 after:rotate-45 cursor-pointer transition-colors"
          />
        </div>
        <div className="text-sm">
          <label
            htmlFor="terms"
            className="font-medium text-syntax-grey cursor-pointer"
          >
            I agree to the{" "}
            <Link href="/terms" className="text-neon-pulse hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-neon-pulse hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
      </div>

      <form action={signInWithGithub}>
        {redirectPath && (
          <input type="hidden" name="redirectTo" value={redirectPath} />
        )}
        <ProviderButton
          provider="GitHub"
          disabled={!agreed}
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          }
        />
      </form>
      <div title="GitLab support coming soon">
        <ProviderButton
          provider="GitLab"
          disabled
          comingSoon
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              style={{ color: "#fc6d26" }}
            >
              <path d="M23.955 13.587l-2.242-6.903c-.206-.633-.695-1.095-1.302-1.233-.607-.138-1.242.062-1.688.531l-3.328 3.518h-6.79l-3.328-3.518c-.446-.469-1.081-.669-1.688-.531-.607.138-1.096.6-1.302 1.233L.045 13.587c-.18.552-.062 1.157.308 1.59l11.082 13.064c.323.382.812.607 1.332.607.52 0 1.01-.225 1.332-.607l11.082-13.064c.37-.433.488-1.038.308-1.59zC23.987 13.682 23.972 13.634 23.955 13.587z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function ProviderButton({
  provider,
  icon,
  disabled,
  comingSoon,
}: {
  provider: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`flex items-center justify-center gap-3 w-full bg-obsidian-night border rounded px-4 py-3 text-white font-mono text-sm group transition-all ${
        disabled
          ? "border-white/5 opacity-50 cursor-not-allowed"
          : "border-white/10 hover:border-neon-pulse/50 hover:bg-white/5"
      }`}
    >
      <span className="opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
      <span>
        Continue with {provider} {comingSoon && "(Soon)"}
      </span>
    </button>
  );
}
