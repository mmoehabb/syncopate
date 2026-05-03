import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy | Syncoboard",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm mt-1">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </header>

        <main className="space-y-8 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            <p>
              Welcome to Syncoboard. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              visit our website or use our application. Please read this privacy
              policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the application.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              2. Information We Collect
            </h2>
            <p>
              We collect information that you voluntarily provide to us when you
              register on the application and link your third-party accounts
              (such as GitHub or GitLab). This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your name, email address, and profile picture.</li>
              <li>
                Information related to your connected repositories, including
                Pull Request names, descriptions, and statuses.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              3. How We Use Your Information
            </h2>
            <p>
              We use the information we collect strictly to provide and improve
              the core functionality of the application. Specifically, we use
              your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Create, identify, and manage your user account.</li>
              <li>
                Synchronize your connected repositories and update your Kanban
                boards using the names, descriptions, and statuses of your Pull
                Requests.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              4. Disclosure of Your Information
            </h2>
            <p>
              We may share information we have collected about you in certain
              situations. Your information may be disclosed as follows: By Law
              or to Protect Rights, Third-Party Service Providers (such as our
              cloud hosting provider), and Other Third Parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              5. Security of Your Information
            </h2>
            <p>
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
