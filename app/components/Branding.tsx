import Image from "next/image";

const coreValues = [
  "Accountability over productivity",
  "Consistency over perfection",
  "Progress over motivation",
  "Community over isolation",
];

export default function Branding() {
  return (
    <div className="hidden min-h-screen w-full flex-col items-start justify-center bg-background px-12 lg:flex">
      <div className="flex max-w-md flex-col gap-10 items-start text-left">
       <div>
         <Image
          src="/pact-logo.png"
          alt="Pact logo"
          width={90}
          height={90}
          priority
        />
        <h1 className="mt-6 font-poppins text-3xl font-bold text-primary">
          Pact - Accountability App
        </h1>
        <p className="mt-4 font-poppins text-lg font-semibold leading-relaxed text-secondary">
          Make a commitment. Keep your word. Build consistency.
        </p>
       </div>
        <div className="mt-10 h-px w-full bg-border/100" />
        <ul className="mt-10 flex flex-col gap-4">
          {coreValues.map((value) => (
            <li
              key={value}
              className="font-nunito text-sm font-semibold text-secondary/90"
            >
              {value}
            </li>
          ))}
        </ul>
        <p className="mt-10 font-nunito text-sm leading-relaxed text-muted/50">
          Pact is an accountability platform where people build consistency by
          making commitments and following through on them together.
        </p>
      </div>
    </div>
  );
}
