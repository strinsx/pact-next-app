import SideNav from "@/app/components/SideNav";
import Profile from "@/app/components/Profile";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1">
        <div className="m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10 px-4 pt-10 md:pt-0">
          <div className="mt-6 w-full">
            <Profile />
          </div>
        </div>
      </main>
    </div>
  );
}
