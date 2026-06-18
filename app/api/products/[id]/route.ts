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

// PUT /api/products/[id] — update a product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const organizationId = await getOrgFromRequest();
  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  await connectDB();

  const product = await Product.findOneAndUpdate(
    { _id: id, organizationId },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!product) {
    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, product });
}

// DELETE /api/products/[id] — delete a product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const organizationId = await getOrgFromRequest();
  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const product = await Product.findOneAndDelete({ _id: id, organizationId });

  if (!product) {
    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Product deleted" });
}
