import SideNav from "@/app/components/SideNav";
import TopBar from "@/app/components/TopBar";
import Home from "@/app/components/Home";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1">
          <Home />
        </main>
      </div>
    </div>
  );
}
