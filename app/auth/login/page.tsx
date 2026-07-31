import Login from "@/app/components/Login";
import Branding from "@/app/components/Branding";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-row-reverse">
      <div className="flex-1">
        <Login />
      </div>
      <div className="hidden border-r border-border border-muted/20 lg:block lg:w-[60%]">
        <Branding />
      </div>
    </div>
  );
}
