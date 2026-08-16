import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "See a Demo" },
  { href: "/groups", label: "Groups" },
];

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Pact home"
        >
          <Image
            src="/pact-logo.png"
            alt="Pact logo"
            width={60}
            height={50}
            priority
          />
          <span className="bg-gradient-to-r from-sky-400 to-purple bg-clip-text font-manrope text-2xl font-bold text-transparent">
            Pact
          </span>

 
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-manrope text-md font-bold text-muted transition-all duration-300 hover:bg-gradient-to-r hover:from-purple hover:to-sky-400 hover:bg-clip-text hover:text-transparent"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-xl px-5 py-2.5 font-manrope text-sm font-bold text-primary transition-colors hover:text-secondary"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-xl border-1 border-border bg-gradient-to-r from-sky-400 to-purple px-5 py-2.5 font-dm-sans text-sm font-bold text-white shadow-lg transition-all duration-300 hover:translate-x-[8px] hover:opacity-90 hover:shadow-xl"
          >
            Start your pact
          </Link>
        </div>
      </nav>
    </header>
  );
}
