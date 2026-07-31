import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex w-full items-center justify-between border-primary bg-transparent px-10 py-9">
      <Link href="/home">
        <Image
          src="/navbar-logo.png"
          alt="Pact logo"
          width={60}
          height={65}
          priority
        />
      </Link>
      <nav className="flex items-center gap-8 font-poppins text-primary">
        <Link href="/home" className="text-lg font-bold">
          Home
        </Link>
        <Link href="/about" className="text-lg font-bold">
          Start Your Pact
        </Link>
         <Link href="/features" className="text-lg font-bold">
          Pricing
        </Link>
      </nav>
      <Link
        href="/auth/signup"
        className="rounded-full border-1 border-primary px-10 py-2 font-poppins text-sm font-bold text-primary"
      >
        Get Started
      </Link>
    </div>
  );
}
