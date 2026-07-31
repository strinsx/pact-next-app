import SignUp from "@/app/components/SignUp";
import Branding from "@/app/components/Branding";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-row-reverse">
      <div className="flex-1">
        <SignUp />
      </div>
      <div className="hidden border-r border-border border-muted/20 lg:block lg:w-[60%]">
        <Branding />
      </div>
    </div>
  );
}
