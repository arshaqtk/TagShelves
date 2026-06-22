"use client";

import { useState, useEffect, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { parseCSV } from "@/components/campaigns/product/csvParser";

interface Product {
  name: string;
  code: string;
  promoPrice: number;
  crossPrice?: number;
  validUntil?: string;
  offer?: string;
  status: "active" | "inactive";
}

const MOCK_PRODUCTS: Product[] = [
  {
    name: "Farinha De Trigo 300g",
    code: "02145A45",
    promoPrice: 2.359,
    crossPrice: 3.299,
    validUntil: "2024-10-12",
    offer: "50% OFF",
    status: "active",
  },
  {
    name: "Vinho Tinto Portugal 750 Ml",
    code: "02145A45",
    promoPrice: 2.359,
    crossPrice: 2.899,
    validUntil: "2024-10-12",
    offer: "BIG OFFER",
    status: "active",
  },
  {
    name: "Sumo Compal 1L",
    code: "02145A45",
    promoPrice: 4.359,
    crossPrice: 5.499,
    validUntil: "2024-10-12",
    offer: "Discount",
    status: "inactive",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Auth state
  const [user, setUser] = useState<any>(null);

  // Step 1: Import List State
  const [isDragOver, setIsDragOver] = useState(false);
  const [importedFile, setImportedFile] = useState<string | null>(null);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);

  // Step 2: Pick Template State
  const [selectedTemplate, setSelectedTemplate] = useState<"standard" | "promo">("standard");

  // Step 3: Print State
  const [showOriginalPrice, setShowOriginalPrice] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Client-side CSV parser
  const parseCSV = (text: string): Product[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    // Parse headers
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Extract columns (basic comma splitting)
      const columns = line.split(",").map(c => c.trim().replace(/['"]/g, ""));
      const prod: any = { status: "active" };

      headers.forEach((header, idx) => {
        const val = columns[idx];
        if (!val) return;

        if (header.includes("name") || header.includes("title") || header.includes("product")) {
          prod.name = val;
        } else if (header.includes("code") || header.includes("sku") || header.includes("id")) {
          prod.code = val;
        } else if (header.includes("promo") || header.includes("price") || header.includes("sale")) {
          prod.promoPrice = parseFloat(val) || 0;
        } else if (header.includes("cross") || header.includes("original") || header.includes("compare") || header.includes("old")) {
          prod.crossPrice = parseFloat(val) || 0;
        } else if (header.includes("valid") || header.includes("expire") || header.includes("date")) {
          prod.validUntil = val;
        } else if (header.includes("offer") || header.includes("discount")) {
          prod.offer = val;
        }
      });

      if (prod.name && prod.promoPrice) {
        products.push(prod as Product);
      }
    }
    return products;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file (.csv)");
      return;
    }
    setImportedFile(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const products = parseCSV(text);
      if (products.length === 0) {
        setError("Could not parse products from CSV. Please check headers (need 'name' and 'price')");
        setImportedFile(null);
        setLoading(false);
        return;
      }
      setParsedProducts(products);
      setSuccess(`${products.length} products loaded successfully from CSV!`);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleStartManually = () => {
    setImportedFile("Demo_Price_List.csv");
    setParsedProducts(MOCK_PRODUCTS);
    setSuccess("Loaded 3 demo products to start manually!");
  };

  const saveProductsToDb = async () => {
    if (parsedProducts.length === 0) {
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedProducts),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save products to database.");
      }

      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving products.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    setIsDone(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsDone(true);
          
          // Complete onboarding redirect
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);

          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#090b0f] text-zinc-200 flex flex-col font-sans select-none">
      {/* Brand Top Header */}
      <header className="px-8 py-5 border-b border-zinc-900 flex justify-between items-center bg-[#0c0e12]">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-white text-md font-bold tracking-wider">tagshelves.com</span>
        </div>
        {user && (
          <div className="text-xs text-zinc-500 font-semibold bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-900">
            {user.email}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl w-full mx-auto">
        
        {/* Onboarding Wizard Header Tabs */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-16 relative">
          <div className="absolute left-0 right-0 bottom-[2px] h-[1px] bg-zinc-800 z-0" />
          
          <button
            type="button"
            className={`flex-1 pb-3 text-center z-10 font-bold text-sm transition-all border-b-[3px] border-transparent ${
              currentStep === 1 ? "text-white border-emerald-500" : "text-zinc-500"
            }`}
          >
            Import List
          </button>
          
          <button
            type="button"
            className={`flex-1 pb-3 text-center z-10 font-bold text-sm transition-all border-b-[3px] border-transparent ${
              currentStep === 2 ? "text-white border-emerald-500" : "text-zinc-500"
            }`}
          >
            Pick Template
          </button>
          
          <button
            type="button"
            className={`flex-1 pb-3 text-center z-10 font-bold text-sm transition-all border-b-[3px] border-transparent ${
              currentStep === 3 ? "text-white border-emerald-500" : "text-zinc-500"
            }`}
          >
            Print Tags
          </button>
        </div>

        {/* Dynamic content depending on step */}
        <div className="w-full flex flex-col items-center">
          
          {/* STEP 1: IMPORT LIST */}
          {currentStep === 1 && (
            <div className="w-full max-w-xl flex flex-col items-center space-y-6">
              
              {error && (
                <div className="w-full px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="w-full px-4 py-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm text-center">
                  {success}
                </div>
              )}

              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDragOver
                    ? "border-emerald-500 bg-emerald-950/10"
                    : "border-zinc-800 bg-[#121620]/30 hover:bg-[#121620]/50 hover:border-zinc-700/80"
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {importedFile ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                      {loading ? (
                        <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-white text-lg font-bold">
                      {loading ? "Parsing File..." : "Price List Loaded!"}
                    </p>
                    <p className="text-zinc-500 text-xs">{importedFile}</p>
                    <span className="text-xs text-zinc-500 hover:text-zinc-300 underline mt-2">
                      Click to choose another file
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-zinc-800/60 text-zinc-400">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <h3 className="text-white text-lg font-bold">
                      Import Your Price List
                    </h3>
                    <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">
                      Drag & Drop A CSV Or Excel File, Or Click To Browse
                    </p>
                  </div>
                )}
              </label>

              <button
                type="button"
                onClick={handleStartManually}
                className="text-zinc-500 hover:text-zinc-300 hover:underline transition-all text-xs font-semibold bg-transparent border-0 cursor-pointer"
              >
                Or Start Manually Without Importing
              </button>

              <div className="w-full flex gap-4 pt-6 border-t border-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3.5 rounded-lg border border-zinc-800 bg-[#0c0e12] hover:bg-[#161b22] text-zinc-300 hover:text-white text-sm font-semibold transition cursor-pointer"
                >
                  Skip For Now
                </button>
                <button
                  type="button"
                  disabled={loading || parsedProducts.length === 0}
                  onClick={saveProductsToDb}
                  className="flex-1 py-3.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition cursor-pointer border-0"
                >
                  {loading ? "Saving..." : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PICK TEMPLATE */}
          {currentStep === 2 && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-white text-lg font-bold">Choose Your First Tag Template</h3>
                <p className="text-zinc-500 text-xs">We'll Auto-Fill Your Product Data From The Imported List</p>
              </div>

              {/* Tag Showcase Mockups */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center w-full">
                
                {/* Standard tag card: 50% OFF */}
                <div
                  onClick={() => {
                    setSelectedTemplate("standard");
                    setCurrentStep(3);
                  }}
                  className={`flex-1 rounded-2xl p-6 bg-[#0c0e12]/60 border transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 hover:scale-[1.02] shadow-xl ${
                    selectedTemplate === "standard" ? "border-emerald-500" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Tag preview matching image 2 */}
                  <div className="w-48 bg-white border border-zinc-200 rounded-xl p-3 text-black text-left flex flex-col justify-between aspect-[3/4]">
                    <div>
                      {/* Badge */}
                      <div className="bg-red-600 text-white text-[9px] font-black tracking-wider text-center py-1 rounded">
                        50% OFF
                      </div>
                      
                      {/* Price section */}
                      <div className="mt-3">
                        <span className="text-[10px] text-zinc-400 font-bold line-through">3.199$</span>
                        <div className="flex items-baseline text-red-600">
                          <span className="text-3xl font-extrabold tracking-tight">2.899</span>
                          <span className="text-md font-bold ml-0.5">$</span>
                        </div>
                      </div>
                      
                      {/* Product Name */}
                      <p className="text-[9px] font-bold text-zinc-800 leading-tight mt-3">
                        Arroz Longo Dourado Familia Feliz
                      </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                      <div className="flex gap-[1px] h-3.5 items-end">
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[2px] h-full bg-black" />
                        <div className="w-[1px] h-[80%] bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[3px] h-[75%] bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                      </div>
                      {/* Target logo bullseye */}
                      <div className="w-4 h-4 rounded-full border-[3px] border-red-600 flex items-center justify-center">
                        <div className="w-1 h-1 bg-red-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-bold">Standard 50% Off Template</span>
                </div>

                {/* Promo tag card: BIG OFFER */}
                <div
                  onClick={() => {
                    setSelectedTemplate("promo");
                    setCurrentStep(3);
                  }}
                  className={`flex-1 rounded-2xl p-6 bg-[#0c0e12]/60 border transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 hover:scale-[1.02] shadow-xl ${
                    selectedTemplate === "promo" ? "border-emerald-500" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Tag preview matching image 2 (Yellow layout) */}
                  <div className="w-48 bg-yellow-400 border border-yellow-500 rounded-xl p-3 text-black text-left flex flex-col justify-between aspect-[3/4]">
                    <div>
                      {/* Badge with blue border/accent */}
                      <div className="bg-red-600 text-white text-[9px] font-black tracking-wider text-center py-1 rounded relative overflow-hidden">
                        BIG OFFER
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600" />
                      </div>
                      
                      {/* Price section */}
                      <div className="mt-3">
                        <span className="text-[10px] text-zinc-600 font-bold line-through">2.899$</span>
                        <div className="flex items-baseline text-red-600">
                          <span className="text-3xl font-extrabold tracking-tight">1.899</span>
                          <span className="text-md font-bold ml-0.5">$</span>
                        </div>
                      </div>
                      
                      {/* Product Name */}
                      <p className="text-[9px] font-bold text-zinc-900 leading-tight mt-3">
                        Arroz Longo Dourado Familia Feliz
                      </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between border-t border-yellow-500/30 pt-2">
                      <div className="flex gap-[1px] h-3.5 items-end">
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[2px] h-full bg-black" />
                        <div className="w-[1px] h-[85%] bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[3px] h-[80%] bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                      </div>
                      {/* Target logo bullseye */}
                      <div className="w-4 h-4 rounded-full border-[3px] border-red-600 flex items-center justify-center">
                        <div className="w-1 h-1 bg-red-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-bold">Promo Yellow Template</span>
                </div>

              </div>

              <div className="w-full flex justify-center pt-6 border-t border-zinc-900/60 max-w-xl">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-1/2 py-3.5 rounded-lg border border-zinc-800 bg-[#0c0e12] hover:bg-[#161b22] text-zinc-300 hover:text-white text-sm font-semibold transition cursor-pointer"
                >
                  Skip For Now
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRINT TAGS */}
          {currentStep === 3 && (
            <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8 items-center md:items-stretch">
              
              {/* Left Config Panel */}
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-white text-xl font-bold mb-4">Print Configuration</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed mb-6">
                    Fine-tune your layout settings. Review the generated PDF file before printing directly.
                  </p>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={showOriginalPrice}
                        onChange={(e) => setShowOriginalPrice(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 bg-[#0c0e12] text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                      />
                      <span className="text-xs font-medium">Show original strikethrough price</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={showBarcode}
                        onChange={(e) => setShowBarcode(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 bg-[#0c0e12] text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                      />
                      <span className="text-xs font-medium">Print barcodes on labels</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 relative">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className={`w-full py-3.5 rounded-lg text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer border-0 relative overflow-hidden ${
                      isDone
                        ? "bg-emerald-600"
                        : isGenerating
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isGenerating && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-emerald-700/40 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    
                    {!isGenerating && !isDone && (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Generate &amp; Complete Onboarding</span>
                      </>
                    )}

                    {isGenerating && (
                      <span className="relative z-10">Generating tag sheet ({progress}%)...</span>
                    )}

                    {isDone && (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>PDF Generated! Launching Console...</span>
                      </>
                    )}
                  </button>
                  
                  <div className="text-[10px] text-zinc-500 text-center mt-2 font-medium italic">
                    Note: Complete this step to load your dashboard console.
                  </div>
                </div>
              </div>

              {/* Right preview panel */}
              <div className="w-full md:w-[45%] flex justify-center bg-[#13171f]/40 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden min-h-[300px]">
                <div className="w-full bg-white rounded shadow-inner p-4 text-gray-800 text-left flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">A4 Tag Sheet Preview</span>
                    <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 font-semibold">10 Tags / Sheet</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 flex-1 my-4 overflow-y-auto max-h-[200px]">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded p-2 text-left flex flex-col justify-between border transition-all ${
                          selectedTemplate === "promo" ? "bg-yellow-400 border-yellow-500" : "bg-zinc-50 border-gray-100"
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[5px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide inline-block ${
                              selectedTemplate === "promo" ? "bg-red-600 text-white" : "bg-red-600 text-white"
                            }`}
                          >
                            {selectedTemplate === "promo" ? "BIG OFFER" : "50% OFF"}
                          </span>
                          {showOriginalPrice && (
                            <p className="text-[7px] text-gray-400 line-through mt-1.5">
                              {selectedTemplate === "promo" ? "2.899$" : "3.199$"}
                            </p>
                          )}
                          <p className="text-red-600 text-xs font-black mt-0.5">
                            {selectedTemplate === "promo" ? "1.899$" : "2.899$"}
                          </p>
                          <p className="text-[7px] text-gray-700 leading-tight mt-1 truncate font-semibold">
                            Arroz Longo Dourado
                          </p>
                        </div>
                        {showBarcode && (
                          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-dashed border-gray-200/60 justify-between">
                            <div className="flex gap-[1px] h-3 items-end">
                              <div className="w-[1px] h-full bg-black" />
                              <div className="w-[2px] h-full bg-black" />
                              <div className="w-[1px] h-[80%] bg-black" />
                              <div className="w-[1px] h-full bg-black" />
                              <div className="w-[3px] h-[85%] bg-black" />
                              <div className="w-[1px] h-full bg-black" />
                            </div>
                            <div className="w-3.5 h-3.5 rounded-full border-[2px] border-red-600 flex items-center justify-center shrink-0">
                              <div className="w-0.5 h-0.5 bg-red-600 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-[8px] text-gray-400 pt-1.5 border-t border-gray-100 font-medium">
                    Dynamic Template Preview
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
