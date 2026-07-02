import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileShell from "@/components/dashboard/ProfileShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProfileData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

  try {
    const res = await fetch(`${backendUrl}/api/profile/summary`, {
      headers: {
        Cookie: `token=${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      if (res.status === 401) {
        redirect("/login");
      }
      throw new Error(`Failed to fetch profile data: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      organizationName: data.organizationName,
      organizationPlan: data.organizationPlan,
      userEmail: data.userEmail,
      products: data.products,
      user: data.user,
    };
  } catch (error) {
    console.error("Profile page data fetch error:", error);
    redirect("/login");
  }
}

export default async function ProfilePage() {
  const profileData = await getProfileData();

  return <ProfileShell {...profileData} />;
}
