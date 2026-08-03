import SideNav from "@/app/components/SideNav";
import GroupsOverviewCard from "@/app/components/GroupsOverviewCard";
import JoinAccessCard from "@/app/components/JoinAccessCard";
import MembersCard from "@/app/components/MembersCard";

export default function GroupsPage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1">
        <div className="m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10 px-4">
          <div id="overview" className="mt-6 w-full scroll-mt-24">
            <GroupsOverviewCard />
          </div>
          <div id="join-access" className="mt-4 w-full scroll-mt-24">
            <JoinAccessCard />
          </div>
          <div id="members" className="mt-4 w-full scroll-mt-24">
            <MembersCard />
          </div>
          <div className="mt-20 w-full" />
        </div>
      </main>
    </div>
  );
}
