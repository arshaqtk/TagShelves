import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CampaignShell from "@/components/campaigns/CampaignShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCampaignData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

  try {
    const res = await fetch(`${backendUrl}/api/campaigns/summary`, {
      headers: {
        Cookie: `token=${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      if (res.status === 401) {
        redirect("/login");
      }
      throw new Error(`Failed to fetch campaigns data: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      organizationName: data.organizationName,
      organizationPlan: data.organizationPlan,
      userEmail: data.userEmail,
      initialProducts: data.initialProducts,
      initialTotalProducts: data.initialTotalProducts,
      initialLimit: data.initialLimit,
      initialStats: data.initialStats,
      users: data.users,
    };
  } catch (error) {
    console.error("Campaigns page data fetch error:", error);
    redirect("/login");
  }
}

export default async function CampaignsPage() {
  const campaignData = await getCampaignData();

  return <CampaignShell {...campaignData} />;
}
