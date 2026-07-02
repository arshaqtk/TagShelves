import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

  try {
    const res = await fetch(`${backendUrl}/api/dashboard/summary`, {
      headers: {
        Cookie: `token=${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      if (res.status === 401) {
        redirect("/login");
      }
      throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      organizationName: data.organizationName,
      organizationPlan: data.organizationPlan,
      userEmail: data.userEmail,
      products: data.products,
      metrics: data.metrics,
      users: data.users,
    };
  } catch (error) {
    console.error("Dashboard page data fetch error:", error);
    redirect("/login");
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  return <DashboardShell {...dashboardData} />;
}
