import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import Product from "@/models/Product";

async function getOrgFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return payload.organizationId as string;
  } catch {
    return null;
  }
}

// GET /api/products — list products for authenticated org
export async function GET() {
  const organizationId = await getOrgFromRequest();
  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const products = await Product.find({ organizationId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ success: true, products });
}

// POST /api/products — create one or many products
export async function POST(req: NextRequest) {
  const organizationId = await getOrgFromRequest();
  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const items = Array.isArray(body) ? body : [body];

  if (items.length === 0) {
    return NextResponse.json({ success: false, message: "No products provided" }, { status: 400 });
  }

  await connectDB();

  const docs = items.map((item) => ({ ...item, organizationId }));
  const inserted = await Product.insertMany(docs, { ordered: false });

  return NextResponse.json(
    {
      success: true,
      message: `${inserted.length} product(s) saved successfully`,
      count: inserted.length,
      products: inserted,
    },
    { status: 201 }
  );
}
