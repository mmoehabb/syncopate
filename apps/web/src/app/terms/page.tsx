import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Terms of Service | Syncopate",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-obsidian-night text-syntax-grey font-mono p-8 selection:bg-neon-pulse/30 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center gap-4 border-b border-white/10 pb-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded bg-obsidian-night border border-white/10 flex items-center justify-center text-neon-pulse font-mono font-bold text-2xl">
              <Logo />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm mt-1">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </header>

        <main className="space-y-8 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              1. Agreement to Terms
            </h2>
            <p>
              By viewing or using this application, you agree to be bound by all
              of these Terms of Service. If you do not agree with any of these
              terms, you are prohibited from using or accessing this site. The
              materials contained in this application are protected by
              applicable copyright and trademark law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Use License</h2>
            <p>
              Permission is granted to temporarily use the materials
              (information or software) on the Syncopate application for
              personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title, and under this
              license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>modify or copy the materials;</li>
              <li>
                use the materials for any commercial purpose, or for any public
                display (commercial or non-commercial);
              </li>
              <li>
                attempt to decompile or reverse engineer any software contained
                on the application;
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials; or
              </li>
              <li>
                transfer the materials to another person or &quot;mirror&quot;
                the materials on any other server.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Disclaimer</h2>
            <p>
              The materials on the Syncopate application are provided on an
              &apos;as is&apos; basis. We make no warranties, expressed or
              implied, and hereby disclaim and negate all other warranties
              including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Limitations</h2>
            <p>
              In no event shall Syncopate or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on the application, even if we
              have been notified orally or in writing of the possibility of such
              damage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              5. Contact Information
            </h2>
            <p>
              If you have any questions regarding these Terms, please contact us
              at:
            </p>
            <div className="bg-void-grey p-4 rounded border border-white/10 text-white">
              <a
                href="mailto:mo.ehab.abdelsalam@gmail.com"
                className="hover:text-neon-pulse transition-colors"
              >
                mo.ehab.abdelsalam@gmail.com
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
