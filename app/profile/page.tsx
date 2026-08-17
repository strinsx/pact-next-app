import SideNav from "@/app/components/SideNav";
import TopBar from "@/app/components/TopBar";
import Profile from "@/app/components/Profile";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1">
          <div className="m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10 px-4 pt-4 md:pt-4">
            <div className="mt-6 w-full">
              <Profile />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
