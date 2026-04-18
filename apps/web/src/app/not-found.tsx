import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-obsidian-night text-white font-mono p-4">
      <div className="max-w-md w-full flex flex-col gap-6 items-center text-center p-8 bg-void-grey border border-white/10 rounded-md shadow-2xl">
        <div className="text-6xl text-neon-pulse mb-2 font-bold">404</div>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-syntax-grey text-sm">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 w-full mt-4">
          <Link
            href="/"
            className="flex-1 text-center bg-git-green text-obsidian-night font-bold hover:bg-opacity-90 font-mono py-2 rounded transition-opacity"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
