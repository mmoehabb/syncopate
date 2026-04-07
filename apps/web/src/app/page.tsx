export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-obsidian-night relative overflow-hidden">
      {/* Background ambient effect simulating a terminal glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-neon-pulse/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-5xl z-10 flex flex-col gap-12">
        {/* Header / Nav Mock */}
        <header className="flex justify-between items-center w-full pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Logo Mark: S-Branch Concept */}
            <div className="w-8 h-8 rounded bg-void-grey border border-white/10 flex items-center justify-center text-neon-pulse font-mono font-bold text-lg">
              {'⑂'}
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Syncopate</h1>
          </div>
          <nav className="flex gap-6 font-mono text-sm">
            <span className="text-white">/board</span>
            <span className="hover:text-white cursor-pointer transition-colors">/pulls</span>
            <span className="hover:text-white cursor-pointer transition-colors">/settings</span>
          </nav>
        </header>

        {/* Hero Concept */}
        <section className="flex flex-col gap-4">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Code-First <br /> Coordination.
          </h2>
          <p className="text-syntax-grey text-lg max-w-xl">
            Your board, on autopilot. Stop updating tickets. Just push code.
          </p>
          <div className="mt-4 flex gap-4">
            <button className="bg-neon-pulse text-obsidian-night px-6 py-2.5 rounded font-mono font-semibold hover:bg-neon-pulse/90 transition-colors">
              $ connect --repo
            </button>
            <button className="surface-panel px-6 py-2.5 font-mono hover:border-syntax-grey/50 transition-colors">
              Read Docs
            </button>
          </div>
        </section>

        {/* Board Dashboard Skeleton */}
        <section className="mt-12">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-mono text-white flex items-center gap-2">
              <span className="text-neon-pulse">●</span> active_sprint
            </h3>
            <span className="font-mono text-xs text-syntax-grey border border-white/10 px-2 py-1 rounded bg-void-grey">
              2 merged · 1 pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              <div className="font-mono text-xs uppercase tracking-wider text-syntax-grey mb-2 flex items-center gap-2">
                <span>In Progress</span>
                <span className="bg-void-grey px-1.5 py-0.5 rounded text-white">2</span>
              </div>
              <Card title="Implement Prisma Schema" pr="—" branch="feat/init-db" status="dev" />
              <Card
                title="Design System Setup"
                pr="#1"
                branch="feat/tailwind-config"
                status="review"
              />
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3">
              <div className="font-mono text-xs uppercase tracking-wider text-syntax-grey mb-2 flex items-center gap-2">
                <span>In Review</span>
                <span className="bg-void-grey px-1.5 py-0.5 rounded text-white">1</span>
              </div>
              <Card
                title="Authentication Service"
                pr="#42"
                branch="feat/auth-core"
                status="approved"
              />
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3">
              <div className="font-mono text-xs uppercase tracking-wider text-syntax-grey mb-2 flex items-center gap-2">
                <span>Merged</span>
                <span className="bg-void-grey px-1.5 py-0.5 rounded text-white">1</span>
              </div>
              <Card
                title="Monorepo Initialization"
                pr="#41"
                branch="chore/monorepo"
                status="merged"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// Mini Component for the skeleton
function Card({
  title,
  pr,
  branch,
  status,
}: {
  title: string
  pr: string
  branch: string
  status: 'dev' | 'review' | 'approved' | 'merged'
}) {
  const statusConfig = {
    dev: { color: 'text-syntax-grey', label: 'DEV' },
    review: { color: 'text-yellow-500', label: 'REVIEW' },
    approved: { color: 'text-git-green', label: 'APPROVED' },
    merged: { color: 'text-purple-500', label: 'MERGED' },
  }

  return (
    <div className="surface-panel p-4 flex flex-col gap-3 hover:border-white/20 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-white group-hover:text-neon-pulse transition-colors">
          {title}
        </span>
        <span
          className={`font-mono text-[10px] px-1.5 py-0.5 rounded bg-obsidian-night border border-white/5 ${statusConfig[status].color}`}
        >
          {statusConfig[status].label}
        </span>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs text-syntax-grey">
        {pr !== '—' && (
          <div className="flex items-center gap-1">
            <span className={status === 'merged' ? 'text-purple-500' : 'text-git-green'}>⑂</span>
            <span>{pr}</span>
          </div>
        )}
        <div className="flex items-center gap-1 bg-obsidian-night px-2 py-0.5 rounded border border-white/5 truncate max-w-[150px]">
          <span className="text-white/40">⎇</span>
          <span className="truncate">{branch}</span>
        </div>
      </div>
    </div>
  )
}
