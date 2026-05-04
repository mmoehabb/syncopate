import Link from "next/link";
import { ParticleNetwork } from "@/components/ui/ParticleNetwork";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen w-full p-8 bg-obsidian-night relative overflow-hidden font-mono">
      {/* Dynamic Background */}
      <ParticleNetwork />

      <main className="w-full max-w-md z-10 flex flex-col gap-8 surface-panel p-8 bg-void-grey/80 backdrop-blur-md border border-white/10 rounded-md shadow-2xl text-center items-center">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Logo Mark: S-Branch Concept */}
          <div className="w-16 h-16 rounded bg-obsidian-night border border-white/10 flex items-center justify-center text-neon-pulse font-bold text-4xl mb-2">
            <Logo />
          </div>

          <div className="text-6xl text-neon-pulse mb-2 font-bold tracking-tight">
            404
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-syntax-grey text-sm">
            The branch you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 w-full mt-4">
          <Link
            href="/"
            className="flex-1 text-center bg-git-green text-obsidian-night font-bold hover:bg-opacity-90 py-2 rounded transition-opacity"
          >
            git checkout main
          </Link>
        </div>
      </main>
    </div>
  );
}
