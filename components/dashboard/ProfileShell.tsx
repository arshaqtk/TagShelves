"use client";

import { useState, useRef } from "react";
import CampaignSidebar from "../campaigns/CampaignSidebar";
import CampaignHeader from "../campaigns/CampaignHeader";
import { getCampaignStats } from "../campaigns/campaignUtils";
import type { CampaignProduct } from "../campaigns/types";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  accountType: string;
  profilePic: string;
}

interface ProfileShellProps {
  organizationName: string;
  organizationPlan: string;
  userEmail: string;
  products: CampaignProduct[];
  user: UserProfile;
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function ProfileShell({
  organizationName,
  organizationPlan,
  userEmail,
  products,
  user: initialUser,
}: ProfileShellProps) {
  const [name, setName] = useState(initialUser.name);
  const [profilePic, setProfilePic] = useState(initialUser.profilePic || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSuccess, setStatusSuccess] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats for sidebar
  const stats = getCampaignStats(products);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files (JPEG, PNG, WEBP) are supported.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setStatusMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/auth/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      setProfilePic(data.url);
      setStatusMessage("Picture uploaded successfully! Save changes to apply.");
      setStatusSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePic = () => {
    setProfilePic("");
    setStatusMessage("Picture removed. Save changes to apply.");
    setStatusSuccess(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage("Name cannot be empty.");
      setStatusSuccess(false);
      return;
    }

    setSaving(true);
    setStatusMessage("");
    setUploadError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profilePic }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setStatusMessage("Profile updated successfully!");
      setStatusSuccess(true);
      
      // Auto refresh page after 1.5 seconds to sync client components and header
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setStatusMessage(err.message || "Error saving profile details.");
      setStatusSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090b0f] text-zinc-200">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <CampaignSidebar
          organizationPlan={organizationPlan}
          organizationName={organizationName}
          stats={stats}
          activeItem="profile"
        />

        {/* Content Section */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <CampaignHeader userEmail={userEmail} />

          {/* Body */}
          <div className="flex-1 px-4 py-6 sm:px-8 space-y-6 max-w-4xl mx-auto w-full">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Account Profile Settings
              </h1>
              <p className="text-zinc-500 text-xs mt-1">
                Customize your display profile details and configure your avatar.
              </p>
            </div>

            {/* Notifications */}
            {statusMessage && (
              <div
                className={`p-3 rounded-lg border text-xs font-semibold ${
                  statusSuccess
                    ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400"
                    : "bg-red-950/20 border-red-900/50 text-red-400"
                }`}
              >
                {statusMessage}
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-lg border bg-red-950/20 border-red-900/50 text-red-400 text-xs font-semibold">
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* LEFT CARD: Picture Uploader (5 cols) */}
              <div className="md:col-span-5 bg-[#0d1017] border border-zinc-800/60 rounded-xl p-6 flex flex-col items-center justify-center space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-center w-full">
                  Profile Picture
                </h4>

                {/* Avatar Preview */}
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-zinc-800 bg-[#121620] flex items-center justify-center select-none shadow-lg">
                  {profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePic}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-zinc-400">
                      {getInitials(name)}
                    </span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <svg
                        className="animate-spin h-6 w-6 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Drag / Select area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`w-full border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-950/10 text-emerald-400"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-[#121620]/30 text-zinc-500"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <svg
                    className="w-5 h-5 mx-auto mb-1.5 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="text-[10px] font-bold text-zinc-300">
                    Drag image here or browse
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-1">
                    Supports JPG, PNG or WEBP (Max 2MB)
                  </p>
                </div>

                {/* Clear Picture button */}
                {profilePic && (
                  <button
                    type="button"
                    onClick={handleRemovePic}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline transition-colors"
                  >
                    Remove Profile Picture
                  </button>
                )}
              </div>

              {/* RIGHT CARD: Information Form (7 cols) */}
              <form
                onSubmit={handleSaveProfile}
                className="md:col-span-7 bg-[#0d1017] border border-zinc-800/60 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Profile Details
                  </h4>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#090b0f] border border-zinc-800 text-xs font-medium text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700 transition"
                    />
                  </div>

                  {/* Email field (readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={initialUser.email}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#121620]/30 border border-zinc-800/40 text-xs font-medium text-zinc-500 cursor-not-allowed outline-none select-none"
                    />
                  </div>

                  {/* Organization Info / Plan details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Role
                      </label>
                      <span className="block px-3.5 py-2.5 rounded-lg bg-[#121620]/30 border border-zinc-800/40 text-xs font-semibold text-zinc-400 select-none capitalize">
                        {initialUser.role}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Account Type
                      </label>
                      <span className="block px-3.5 py-2.5 rounded-lg bg-[#121620]/30 border border-zinc-800/40 text-xs font-semibold text-zinc-400 select-none">
                        {initialUser.accountType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-zinc-900 mt-6">
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-[#00DC82] hover:bg-[#00c575] active:scale-95 text-black text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-md shadow-emerald-950/20"
                  >
                    {saving ? "Saving changes..." : "Save Changes"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
