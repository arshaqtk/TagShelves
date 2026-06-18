import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CampaignShell from "@/components/campaigns/CampaignShell";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import Organization from "@/models/Organization";
import Product from "@/models/Product";
import User from "@/models/User";
import type { CampaignProduct } from "@/components/campaigns/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LeanProduct = {
  _id: { toString: () => string };
  name: string;
  code: string;
  promoPrice: number;
  crossPrice?: number;
  validUntil?: Date | string;
  offer?: string;
  status?: "active" | "inactive";
};

type LeanUser = {
  _id: { toString: () => string };
  name: string;
  email: string;
  role: string;
};

type LeanOrganization = {
  name?: string;
  plan?: string;
};

function serializeProduct(product: LeanProduct): CampaignProduct {
  return {
    id: product._id.toString(),
    name: product.name,
    code: product.code,
    promoPrice: product.promoPrice,
    crossPrice: product.crossPrice,
    validUntil: product.validUntil ? new Date(product.validUntil).toISOString() : null,
    offer: product.offer ?? null,
    status: product.status === "inactive" ? "inactive" : "active",
  };
}

function serializeUser(user: LeanUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function getCampaignData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    redirect("/login");
  }

  await connectDB();

  const [organization, products, users] = await Promise.all([
    Organization.findById(payload.organizationId).select("name plan").lean(),
    Product.find({ organizationId: payload.organizationId }).sort({ createdAt: -1 }).lean(),
    User.find({ organizationId: payload.organizationId }).select("name email role").lean(),
  ]);

  const org = organization as LeanOrganization | null;
  const productDocs = products as LeanProduct[];
  const userDocs = (users || []) as LeanUser[];

  return {
    organizationName: org?.name ?? "Target Australia",
    organizationPlan: org?.plan ?? "free",
    userEmail: payload.email,
    products: productDocs.map(serializeProduct),
    users: userDocs.map(serializeUser),
  };
}

export default async function CampaignsPage() {
  const campaignData = await getCampaignData();

  return <CampaignShell {...campaignData} />;
}
