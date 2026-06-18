import type { CampaignProduct, CampaignStats } from "./types";

export function formatDate(value: string | null) {
  if (!value) return "No end date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replaceAll("/", "-");
}

export function formatPrice(value?: number) {
  if (typeof value !== "number") return "$0.000";
  return `$${value.toFixed(3)}`;
}

export function calculateLift(product: CampaignProduct) {
  if (!product.crossPrice || product.crossPrice <= 0) return 0;

  const discount = ((product.crossPrice - product.promoPrice) / product.crossPrice) * 100;
  return Math.max(0, Math.round(discount));
}

export function getCampaignStats(products: CampaignProduct[]): CampaignStats {
  return products.reduce(
    (stats, product) => {
      const crossPrice = product.crossPrice ?? 0;

      if (product.status === "active") {
        stats.activeOffers += 1;
      } else {
        stats.expiredOffers += 1;
      }

      stats.productCount += 1;
      stats.estimatedSavings += Math.max(crossPrice - product.promoPrice, 0);

      return stats;
    },
    {
      activeOffers: 0,
      expiredOffers: 0,
      productCount: 0,
      estimatedSavings: 0,
    }
  );
}
