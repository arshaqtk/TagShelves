export interface Product {
  id: string;
  name: string;
  code: string;
  promoPrice: number;
  crossPrice?: number;
  validUntil: string | null;
  offer: string | null;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  accountType: "Business" | "Individual";
  profilePic: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id?: string;
  name: string;
  email?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignStats {
  activeOffers: number;
  expiredOffers: number;
  productCount: number;
  estimatedSavings: number;
}
