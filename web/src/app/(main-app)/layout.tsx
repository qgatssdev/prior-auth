import AppSidebar from "@/components/layout/appSidebar";
import TopBar from "@/components/layout/topBar";

// The signed-in app shell: sidebar on desktop, top bar on smaller screens.
export default function MainAppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
