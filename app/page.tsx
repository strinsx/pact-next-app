import LandingNavbar from "@/app/components/LandingNavbar";
import Hero from "@/app/components/Hero";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        <Hero />
        <section id="how-it-works" className="scroll-mt-24" />
        <section id="demo" className="scroll-mt-24" />
      </main>
    </div>
  );
}
