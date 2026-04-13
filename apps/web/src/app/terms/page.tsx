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
            <h2 className="text-xl font-bold text-white">
              2. Open Source License
            </h2>
            <p>
              The Syncopate application is open-source software and its
              underlying source code is licensed under the MIT License. You are
              free to use, modify, and distribute the code subject to the
              conditions of the MIT License provided in the software&apos;s
              repository.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              3. Disclaimer of Warranty
            </h2>
            <p>
              The Syncopate application and its materials are provided &quot;as
              is&quot;, without warranty of any kind, express or implied,
              including but not limited to the warranties of merchantability,
              fitness for a particular purpose and noninfringement. We make no
              warranties that the service will be uninterrupted, error-free, or
              completely secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              4. Limitation of Liability
            </h2>
            <p>
              In no event shall the authors or copyright holders of Syncopate be
              liable for any claim, damages, or other liability, whether in an
              action of contract, tort or otherwise, arising from, out of or in
              connection with the application or the use or other dealings in
              the application. This includes, without limitation, damages for
              loss of data, profit, or due to business interruption.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
