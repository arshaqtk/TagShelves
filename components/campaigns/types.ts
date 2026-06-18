export interface CampaignProduct {
  id: string;
  name: string;
  code: string;
  promoPrice: number;
  crossPrice?: number;
  validUntil: string | null;
  offer: string | null;
  status: "active" | "inactive";
}

export interface CampaignStats {
  activeOffers: number;
  expiredOffers: number;
  productCount: number;
  estimatedSavings: number;
}
