import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { MatrixBackground } from "@/components/landing/MatrixBackground";
import { Idea } from "@/components/landing/Idea";
import { Plans } from "@/components/landing/Plans";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center min-h-screen bg-obsidian-night relative overflow-x-hidden">
      <MatrixBackground />
      <div className="w-full max-w-6xl px-6 flex flex-col">
        <Header />
        <main className="flex flex-col w-full">
          <Hero />
          <Idea />
          <Plans />
        </main>
        <Footer />
      </div>
    </div>
  );
}
