"use client";

import { useState, useEffect, useRef } from "react";
import CampaignHeader from "./CampaignHeader";
import CampaignSidebar from "./CampaignSidebar";
import CampaignTable from "./CampaignTable";
import AddProductModal from "./AddProductModal";
import type { CampaignProduct, CampaignStats } from "./types";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CampaignShellProps {
  organizationName: string;
  organizationPlan: string;
  userEmail: string;
  initialProducts: CampaignProduct[];
  initialTotalProducts: number;
  initialLimit: number;
  initialStats: CampaignStats;
  users: TeamUser[];
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function CampaignShell({
  organizationName,
  organizationPlan,
  userEmail,
  initialProducts,
  initialTotalProducts,
  initialLimit,
  initialStats,
  users,
}: CampaignShellProps) {
  // ── Products state ──────────────────────────────────────────────
  const [products, setProducts] = useState<CampaignProduct[]>(initialProducts);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [limit, setLimit] = useState(initialLimit);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<CampaignStats>(initialStats);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "lift">("name");
  const [loading, setLoading] = useState(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CampaignProduct | null>(null);

  const isFirstRender = useRef(true);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = async (
    targetPage: number,
    targetSearch: string,
    targetStatus: string,
    targetSort: string
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: targetPage.toString(),
        limit: limit.toString(),
        search: targetSearch,
        status: targetStatus,
        sortBy: targetSort,
      });
      const res = await fetch(`/api/products?${queryParams}`);
      const data = await res.json();
      if (data.success) {
        setProducts(
          data.products.map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            code: p.code,
            promoPrice: p.promoPrice,
            crossPrice: p.crossPrice,
            validUntil: p.validUntil ? new Date(p.validUntil).toISOString() : null,
            offer: p.offer || null,
            status: p.status === "inactive" ? "inactive" : "active",
          }))
        );
        setTotalProducts(data.pagination.totalProducts);
        setStats(data.stats);
        setPage(data.pagination.page);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when parameters or page changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchProducts(page, debouncedSearch, statusFilter, sortBy);
  }, [page, debouncedSearch, statusFilter, sortBy]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: "all" | "active" | "inactive") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSortByChange = (val: "name" | "price-asc" | "price-desc" | "lift") => {
    setSortBy(val);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEdit = (product: CampaignProduct) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleProductSaved = (saved: CampaignProduct, isEdit: boolean) => {
    fetchProducts(page, debouncedSearch, statusFilter, sortBy);
  };

  const handleBulkSaved = (saved: CampaignProduct[]) => {
    setPage(1);
    fetchProducts(1, debouncedSearch, statusFilter, sortBy);
  };

  const handleProductDeleted = (productId: string) => {
    const isLastItemOnPage = products.length === 1 && page > 1;
    const targetPage = isLastItemOnPage ? page - 1 : page;
    if (isLastItemOnPage) {
      setPage(targetPage);
    } else {
      fetchProducts(targetPage, debouncedSearch, statusFilter, sortBy);
    }
  };

  // ── Team modal state ─────────────────────────────────────────────
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>(users);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Add user form state
  const [userName, setUserName] = useState("");
  const [userEmail2, setUserEmail2] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<"owner" | "member">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTeamError("");
    setTeamSuccess("");

    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email: userEmail2, password: userPassword, role: userRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTeamError(data.message || "Failed to create user. Please try again.");
      } else {
        setTeamSuccess("Team member added successfully!");
        setTeamUsers((prev) => [...prev, data.user]);
        setUserName("");
        setUserEmail2("");
        setUserPassword("");
        setUserRole("member");
      }
    } catch {
      setTeamError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#090b0f] text-zinc-200">
      <div className="flex min-h-screen">
        <CampaignSidebar
          organizationPlan={organizationPlan}
          organizationName={organizationName}
          stats={stats}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <CampaignHeader userEmail={userEmail} />

          <div className="flex-1 px-4 py-5 sm:px-7">
            {/* Page title row */}
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[10px] font-black">
                    T
                  </span>
                  {organizationName}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                <span>{stats.productCount} listed products</span>

                {/* Team avatar trigger */}
                <div
                  onClick={() => setShowTeamModal(true)}
                  className="flex items-center gap-2 cursor-pointer bg-[#121620]/40 border border-zinc-800 hover:border-zinc-700 rounded-full px-3 py-1.5 transition-all active:scale-95"
                >
                  <div className="flex -space-x-2.5">
                    {teamUsers.slice(0, 4).map((u, i) => (
                      <span
                        key={u.id}
                        className={`h-7 w-7 rounded-full border border-[#0b0e13] flex items-center justify-center text-[9px] font-bold text-white uppercase shadow-md ${i % 4 === 0
                            ? "bg-zinc-600"
                            : i % 4 === 1
                              ? "bg-red-600"
                              : i % 4 === 2
                                ? "bg-emerald-600"
                                : "bg-sky-600"
                          }`}
                      >
                        {getInitials(u.name)}
                      </span>
                    ))}
                    {teamUsers.length === 0 && (
                      <span className="h-7 w-7 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-[12px] text-zinc-500 bg-transparent">
                        +
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-zinc-300 hover:text-white transition-colors">
                    {teamUsers.length} Team {teamUsers.length === 1 ? "Member" : "Members"}
                  </span>
                </div>
              </div>
            </div>

            {/* Products table */}
            <CampaignTable
              products={products}
              stats={stats}
              page={page}
              limit={limit}
              totalProducts={totalProducts}
              totalPages={Math.ceil(totalProducts / limit)}
              onPageChange={setPage}
              search={search}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
              onAddNew={handleOpenAdd}
              onEdit={handleOpenEdit}
              onDelete={handleProductDeleted}
              loading={loading}
            />
          </div>
        </section>
      </div>

      {/* Add / Edit Product Modal */}
      <AddProductModal
        open={productModalOpen}
        editProduct={editingProduct}
        onClose={() => setProductModalOpen(false)}
        onProductSaved={handleProductSaved}
        onBulkSaved={handleBulkSaved}
      />

      {/* ── Team Management Modal ──────────────────────────────────── */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl bg-[#0d1017] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Close */}
            <button
              onClick={() => setShowTeamModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Members list */}
            <div className="flex-1 flex flex-col min-w-0">
              <h2 className="text-white text-lg font-bold mb-1">Organization Directory</h2>
              <p className="text-zinc-500 text-xs mb-6">Manage user accounts and system access privileges.</p>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
                {teamUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 bg-[#131722]/30 border border-zinc-900 rounded-xl p-3"
                  >
                    <span className="h-9 w-9 rounded-full bg-zinc-700/60 flex items-center justify-center text-xs font-bold text-white uppercase border border-zinc-800 shrink-0">
                      {getInitials(u.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-bold truncate leading-snug">{u.name}</p>
                      <p className="text-zinc-500 text-[10px] truncate leading-none mt-0.5">{u.email}</p>
                    </div>
                    <span
                      className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${u.role === "owner"
                          ? "border-red-900/40 bg-red-950/20 text-red-400"
                          : "border-emerald-900/40 bg-emerald-950/20 text-emerald-400"
                        }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}

                {teamUsers.length === 0 && (
                  <div className="text-center py-10 text-zinc-500 text-xs italic">
                    No other users registered in this organization.
                  </div>
                )}
              </div>
            </div>

            {/* Add user form */}
            <div className="w-full md:w-[380px] bg-[#121620]/30 border border-zinc-900 rounded-xl p-5 shrink-0 flex flex-col justify-between">
              <div>
                <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Team Member
                </h3>

                {teamError && (
                  <div className="mb-4 px-3 py-2 rounded bg-red-950/30 border border-red-900/50 text-red-400 text-[10px]">
                    {teamError}
                  </div>
                )}

                {teamSuccess && (
                  <div className="mb-4 px-3 py-2 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-[10px]">
                    {teamSuccess}
                  </div>
                )}

                <form onSubmit={handleAddUser} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={userName}
                    onChange={(e) => { setUserName(e.target.value); setTeamError(""); setTeamSuccess(""); }}
                    required
                    className="w-full px-3 py-2 rounded bg-[#090b0f] border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 outline-none focus:border-zinc-700 transition"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={userEmail2}
                    onChange={(e) => { setUserEmail2(e.target.value); setTeamError(""); setTeamSuccess(""); }}
                    required
                    className="w-full px-3 py-2 rounded bg-[#090b0f] border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 outline-none focus:border-zinc-700 transition"
                  />
                  <input
                    type="password"
                    placeholder="Set Password"
                    value={userPassword}
                    onChange={(e) => { setUserPassword(e.target.value); setTeamError(""); setTeamSuccess(""); }}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 rounded bg-[#090b0f] border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 outline-none focus:border-zinc-700 transition"
                  />

                  <div className="flex gap-4 items-center text-[10px] text-zinc-400 pt-1">
                    <span>Role:</span>
                    {(["member", "owner"] as const).map((r) => (
                      <label key={r} className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors">
                        <input
                          type="radio"
                          checked={userRole === r}
                          onChange={() => setUserRole(r)}
                          className="accent-emerald-500 w-3 h-3 cursor-pointer"
                        />
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? "Adding..." : "Add User"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
