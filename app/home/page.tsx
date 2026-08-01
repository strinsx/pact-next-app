import SideNav from "@/app/components/SideNav";
import Home from "@/app/components/Home";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1">
        <Home />
      </main>
    </div>
  );
}
