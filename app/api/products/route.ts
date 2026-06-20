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

import { getDbStats } from "@/lib/dbUtils";
import mongoose from "mongoose";

// GET /api/products — list products for authenticated org
export async function GET(req: NextRequest) {
  const organizationId = await getOrgFromRequest();
  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "name";

  // Build the match conditions
  const matchConditions: any = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
  };

  // Search filter (matches name or code, case-insensitive)
  if (search) {
    matchConditions.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  // Status filter
  if (status === "active") {
    matchConditions.status = "active";
  } else if (status === "inactive") {
    matchConditions.status = "inactive";
  }

  // Calculate dynamic lift field for sorting
  const pipeline: any[] = [
    { $match: matchConditions },
    {
      $addFields: {
        lift: {
          $cond: {
            if: { $and: [{ $gt: ["$crossPrice", 0] }, { $ne: ["$crossPrice", null] }] },
            then: {
              $multiply: [
                { $divide: [{ $subtract: ["$crossPrice", "$promoPrice"] }, "$crossPrice"] },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    },
  ];

  // Apply sorting
  const sortStage: any = {};
  if (sortBy === "name") {
    sortStage.name = 1;
  } else if (sortBy === "price-asc") {
    sortStage.promoPrice = 1;
  } else if (sortBy === "price-desc") {
    sortStage.promoPrice = -1;
  } else if (sortBy === "lift") {
    sortStage.lift = -1;
  } else {
    sortStage.createdAt = -1;
  }
  pipeline.push({ $sort: sortStage });

  // Get total count of matching products
  const countPipeline = [...pipeline, { $count: "count" }];
  const countResult = await Product.aggregate(countPipeline);
  const totalProducts = countResult[0]?.count || 0;

  // Apply pagination skip and limit
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // Execute aggregation
  const rawProducts = await Product.aggregate(pipeline);

  // Map _id to id to match schema expectations
  const products = rawProducts.map((p) => ({
    ...p,
    id: p._id.toString(),
  }));

  // Fetch db stats for organization
  const stats = await getDbStats(organizationId);

  const totalPages = Math.ceil(totalProducts / limit);

  return NextResponse.json({
    success: true,
    products,
    pagination: {
      totalProducts,
      totalPages,
      page,
      limit,
    },
    stats,
  });
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
