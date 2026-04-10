import { signIn } from "@/lib/auth";
import { ParticleNetwork } from "./ParticleNetwork";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen w-full p-8 bg-obsidian-night relative overflow-hidden">
      {/* Dynamic Background */}
      <ParticleNetwork />

      <main className="w-full max-w-md z-10 flex flex-col gap-8 surface-panel p-8 bg-void-grey/80 backdrop-blur-md border-white/10">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Logo Mark: S-Branch Concept */}
          <div className="w-16 h-16 rounded bg-obsidian-night border border-white/10 flex items-center justify-center text-neon-pulse font-mono font-bold text-4xl mb-2">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Syncopate
          </h1>
          <p className="text-syntax-grey text-sm font-mono">
            If the code moves, the card moves.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <ProviderButton
              provider="GitHub"
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

        <div className="text-center mt-4">
          <p className="text-[10px] text-syntax-grey font-mono opacity-50">
            By connecting your account, you agree to the Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}

function ProviderButton({
  provider,
  icon,
  disabled,
}: {
  provider: string;
  icon: React.ReactNode;
  disabled?: boolean;
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
        Continue with {provider} {disabled && "(Soon)"}
      </span>
    </button>
  );
}
