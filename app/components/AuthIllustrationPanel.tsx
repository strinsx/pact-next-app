import Image from "next/image";

interface AuthIllustrationPanelProps {
  mascot?: string;
}

export default function AuthIllustrationPanel({
  mascot = "/paxi.svg",
}: AuthIllustrationPanelProps) {
  return (
    <div className="relative hidden w-full items-center justify-center overflow-hidden bg-gradient-to-b from-blue-700 to-sky-400 p-10 lg:flex lg:w-[50%] lg:p-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.3),rgba(86,217,200,0.18)_45%,transparent_70%)] blur-2xl"
      />

      <div className="flex h-full w-full flex-col justify-between">
        <div>
          <h1 className="max-w-md font-manrope text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md md:text-5xl">
            Progress feels good with a little company.
          </h1>
          <p className="mt-4 max-w-md font-dm-sans text-base leading-relaxed text-white/70">
            Stay on track with friends who keep you honest and celebrate every
            win along the way.
          </p>
        </div>

        <Image
          src={mascot}
          alt="Paxi mascot"
          width={420}
          height={420}
          priority
          className="relative z-10 bottom-4 h-auto max-w-full object-contain"
        />
      </div>
    </div>
  );
}