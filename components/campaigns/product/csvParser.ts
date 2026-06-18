import type { ParsedRow } from "./types";

// ─── CSV line splitter (handles quoted fields) ────────────────────────────────
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ─── Header aliases ────────────────────────────────────────────────────────────
const ALIASES: Record<string, string[]> = {
  name:       ["name", "productname", "article", "articlename", "item"],
  code:       ["code", "sku", "barcode", "articlecode", "id"],
  promoPrice: ["promoprice", "price", "saleprice", "promo"],
  crossPrice: ["crossprice", "originalprice", "regular", "regularprice", "rrp"],
  validUntil: ["validuntil", "expiry", "expirydate", "validto", "enddate"],
  offer:      ["offer", "offertype", "promotion", "deal"],
  status:     ["status", "active"],
};

// ─── Main parser ──────────────────────────────────────────────────────────────
/**
 * Parses CSV text into ParsedRow[].
 * - Case-insensitive, whitespace-trimmed header matching via ALIASES.
 * - Each row gets an `_error` field if name/code/promoPrice is invalid.
 */
export function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rawHeaders = splitCSVLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "")
  );

  const COL: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    const idx = rawHeaders.findIndex((h) => aliases.includes(h));
    if (idx !== -1) COL[field] = idx;
  }

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    if (cells.every((c) => !c.trim())) continue;

    const get = (field: string) =>
      COL[field] !== undefined ? (cells[COL[field]] ?? "").trim() : "";

    const name  = get("name");
    const code  = get("code").toUpperCase();
    const promoPrice  = parseFloat(get("promoPrice").replace(/[^0-9.]/g, ""));
    const crossRaw    = get("crossPrice").replace(/[^0-9.]/g, "");
    const crossPrice  = crossRaw ? parseFloat(crossRaw) : undefined;

    const statusRaw = get("status").toLowerCase();
    const status: "active" | "inactive" =
      statusRaw === "inactive" || statusRaw === "false" || statusRaw === "0"
        ? "inactive"
        : "active";

    const validUntilRaw = get("validUntil");
    let validUntil: string | undefined;
    if (validUntilRaw) {
      const d = new Date(validUntilRaw);
      validUntil = isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
    }

    const offer = get("offer") || undefined;

    let _error: string | undefined;
    if (!name)                          _error = "Missing name";
    else if (!code)                     _error = "Missing code";
    else if (isNaN(promoPrice) || promoPrice <= 0) _error = "Invalid promo price";

    rows.push({ name, code, promoPrice, crossPrice, validUntil, offer, status, _error });
  }

  return rows;
}

// ─── Sample CSV download ───────────────────────────────────────────────────────
export function downloadSampleCSV() {
  const csv = [
    "name,code,promoPrice,crossPrice,validUntil,offer,status",
    "Arroz Longo Dourado 1kg,ARR001,1.599,2.299,2025-12-31,Flash Sale,active",
    "Vinho Tinto Portugal 750ml,VIN002,5.999,7.499,,Discount 20%,active",
    "Sumo Compal 1L,SUC003,1.299,1.799,2025-11-30,Bundle Deal,active",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tagshelves_products_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
