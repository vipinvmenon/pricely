import type { ReactNode } from "react";

import { DesktopNav } from "@/components/layout/DesktopNav";
import { TabBar } from "@/components/layout/TabBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-[100svh] bg-[var(--gradient-void-dark)]">
			<div className="flex min-h-[100svh] w-full">
				<DesktopNav />
				<main className="flex-1 p-3 pb-[calc(96px+env(safe-area-inset-bottom))] lg:p-4">
					{children}
				</main>
			</div>
			<TabBar />
		</div>
	);
}
