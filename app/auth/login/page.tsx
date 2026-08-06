import AuthForm from "@/app/components/AuthForm";
import Branding from "@/app/components/Branding";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-row-reverse">
      <div className="flex-1">
        <AuthForm initialMode="signin" />
      </div>
      <div className="hidden border-r border-border border-muted/20 lg:block lg:w-[60%]">
        <Branding />
      </div>
    </div>
  );
}
