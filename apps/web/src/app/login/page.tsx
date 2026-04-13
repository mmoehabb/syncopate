import { ParticleNetwork } from "./ParticleNetwork";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";
import { AlphaBadge } from "@/components/AlphaBadge";

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

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Syncopate
            </h1>
            <AlphaBadge />
          </div>
          <p className="text-syntax-grey text-sm font-mono">
            If the code moves, the card moves.
          </p>
        </div>

        <LoginForm />
      </main>
    </div>
  );
}
