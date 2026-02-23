import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, TrendingDown, ExternalLink, Star, Truck, Clock, Shield, ArrowLeft, ChevronDown, Loader2, Wifi, RefreshCw, Camera, FlaskConical, BadgePercent, Sparkles, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

type PriceRow = {
  id: string;
  price: number;
  delivery_charge: number;
  delivery_days: string | null;
  cod_available: boolean;
  pharmacies: { name: string; rating: number | null; website_url: string | null; slug: string } | null;
};

type LivePrice = {
  pharmacy: string;
  slug: string;
  price: number | null;
  deliveryCharge: number | null;
  link: string;
  available: boolean;
  error?: string;
};

type MedicineRow = {
  id: string;
  name: string;
  salt_name: string | null;
  manufacturer: string | null;
  slug: string;
};

type Alternative = {
  name: string;
  manufacturer: string;
  salt_name: string;
  estimated_price: number;
  savings_percent: number;
  reason: string;
};

const PHARMACY_SEARCH_URLS: Record<string, (med: string) => string> = {
  "tata-1mg": (med) => `https://www.1mg.com/search/all?name=${encodeURIComponent(med)}`,
  "pharmeasy": (med) => `https://pharmeasy.in/search/all?name=${encodeURIComponent(med)}`,
  "netmeds": (med) => `https://www.google.com/search?q=site:netmeds.com+${encodeURIComponent(med)}`,
  "apollo-pharmacy": (med) => `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(med)}`,
  "medplus": (med) => `https://www.medplusmart.com/searchProduct.mart?searchKey=${encodeURIComponent(med)}`,
  "flipkart-health": (med) => `https://www.flipkart.com/search?q=${encodeURIComponent(med)}&otracker=search&as-show=on`,
  "medkart": (med) => `https://www.medkart.in/search/all?search=${encodeURIComponent(med)}`,
};

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState<"total" | "price" | "rating">("total");
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [showLive, setShowLive] = useState(false);
  const [identifyingImage, setIdentifyingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdentifyingImage(true);
    toast({ title: "Identifying medicine...", description: "Analyzing the image with AI" });

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("identify-medicine", {
        body: { imageBase64: base64 },
      });

      if (error || !data?.success || data.medicineName === "UNKNOWN") {
        toast({ title: "Could not identify", description: "Try a clearer image of the medicine", variant: "destructive" });
      } else {
        toast({ title: "Medicine identified!", description: data.medicineName });
        setSearchInput(data.medicineName);
        searchMedicines(data.medicineName);
      }
    } catch (err) {
      console.error("Image identification failed:", err);
      toast({ title: "Error", description: "Failed to process image", variant: "destructive" });
    }

    setIdentifyingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const searchMedicines = async (q: string) => {
    setLoading(true);
    setLivePrices([]);
    setShowLive(false);
    const { data } = await supabase
      .from("medicines")
      .select("id, name, salt_name, manufacturer, slug")
      .or(`name.ilike.%${q}%,salt_name.ilike.%${q}%`)
      .limit(20);

    const meds = (data || []) as MedicineRow[];
    setMedicines(meds);

    if (meds.length > 0) {
      setSelectedMedicine(meds[0]);
      await loadPrices(meds[0].id);
      fetchAlternatives(meds[0].name, meds[0].salt_name);
    } else {
      // No DB match — create a virtual medicine entry and auto-fetch live prices
      const virtualMedicine: MedicineRow = {
        id: "virtual",
        name: q,
        salt_name: null,
        manufacturer: null,
        slug: q.toLowerCase().replace(/\s+/g, "-"),
      };
      setSelectedMedicine(virtualMedicine);
      setPrices([]);
      setLoading(false);
      // Auto-fetch live prices for non-DB medicines
      fetchLivePrices(q);
      fetchAlternatives(q, null);
      return;
    }
    setLoading(false);
  };

  const loadPrices = async (medicineId: string) => {
    const { data } = await supabase
      .from("prices")
      .select("id, price, delivery_charge, delivery_days, cod_available, pharmacies(name, rating, website_url, slug)")
      .eq("medicine_id", medicineId);

    setPrices((data || []) as unknown as PriceRow[]);
  };

  const fetchLivePrices = async (medicineName?: string) => {
    const medName = medicineName || selectedMedicine?.name;
    if (!medName) return;
    setLiveLoading(true);
    setShowLive(true);
    setLivePrices([]);

    const defaultPharmacies = [
      { slug: "tata-1mg", name: "Tata 1mg" },
      { slug: "pharmeasy", name: "PharmEasy" },
      { slug: "netmeds", name: "Netmeds" },
      { slug: "apollo-pharmacy", name: "Apollo Pharmacy" },
      { slug: "medplus", name: "MedPlus" },
      { slug: "medkart", name: "Medkart" },
    ];

    const pharmacyList = prices.length > 0
      ? prices.map((p) => ({
          slug: p.pharmacies?.slug || "",
          name: p.pharmacies?.name || "",
        })).filter((p) => p.slug)
      : defaultPharmacies;

    // Progressive loading: fire all pharmacy requests in parallel,
    // update UI as each one resolves
    let completedCount = 0;
    const totalCount = pharmacyList.length;

    const promises = pharmacyList.map(async (pharmacy) => {
      try {
        const { data, error } = await supabase.functions.invoke("scrape-prices", {
          body: {
            medicineName: medName,
            pharmacies: [pharmacy],
            single: true,
          },
        });

        if (!error && data?.success && data.prices?.[0]) {
          setLivePrices((prev) => [...prev, data.prices[0]]);
        }
      } catch (err) {
        console.error(`Live price fetch failed for ${pharmacy.name}:`, err);
      } finally {
        completedCount++;
        if (completedCount >= totalCount) {
          setLiveLoading(false);
        }
      }
    });

    await Promise.allSettled(promises);
    setLiveLoading(false);
  };

  const fetchAlternatives = async (medName: string, salt: string | null) => {
    setAlternativesLoading(true);
    setAlternatives([]);
    try {
      const { data, error } = await supabase.functions.invoke("find-alternatives", {
        body: { medicineName: medName, saltName: salt },
      });
      if (!error && data?.success && Array.isArray(data.alternatives)) {
        setAlternatives(data.alternatives);
      }
    } catch (err) {
      console.error("Failed to fetch alternatives:", err);
    }
    setAlternativesLoading(false);
  };

  useEffect(() => {
    if (query) searchMedicines(query);
    else setLoading(false);
  }, [query]);

  // Merge live prices with DB prices
  const displayPrices = showLive && livePrices.length > 0
    ? livePrices
      .filter((lp) => lp.price !== null)
      .map((lp) => {
        const dbMatch = prices.find((p) => p.pharmacies?.slug === lp.slug);
        return {
          id: dbMatch?.id || lp.slug,
          price: lp.price!,
          delivery_charge: lp.deliveryCharge || 0,
          delivery_days: dbMatch?.delivery_days || null,
          cod_available: dbMatch?.cod_available || false,
          link: lp.link,
          pharmacies: {
            name: lp.pharmacy,
            rating: dbMatch?.pharmacies?.rating || null,
            website_url: dbMatch?.pharmacies?.website_url || null,
            slug: lp.slug,
          },
          isLive: true,
        };
      })
    : prices.map((p) => ({ ...p, link: null as string | null, isLive: false }));

  const sorted = [...displayPrices].sort((a, b) => {
    if (sortBy === "rating") return (b.pharmacies?.rating || 0) - (a.pharmacies?.rating || 0);
    if (sortBy === "price") return a.price - b.price;
    return (a.price + (a.delivery_charge || 0)) - (b.price + (b.delivery_charge || 0));
  });

  const lowest = sorted.length > 0 ? Math.min(...sorted.map((p) => p.price + (p.delivery_charge || 0))) : 0;
  const highest = sorted.length > 0 ? Math.max(...sorted.map((p) => p.price + (p.delivery_charge || 0))) : 0;
  const savingsPercent = highest > 0 ? Math.round(((highest - lowest) / highest) * 100) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) searchMedicines(searchInput.trim());
  };

  const getVisitUrl = (slug: string, websiteUrl: string | null, link: string | null) => {
    // Always prefer our known search URLs — scraped links are often broken/relative
    const urlFn = PHARMACY_SEARCH_URLS[slug];
    if (urlFn && selectedMedicine) return urlFn(selectedMedicine.name);
    // Only use scraped link if it's a full valid URL
    if (link && link !== "#" && link.startsWith("https://")) return link;
    return websiteUrl || "#";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {query && (
          <h2 className="mb-4 font-heading text-xl text-muted-foreground">
            Showing results for "<span className="font-semibold text-foreground">{query}</span>"
          </h2>
        )}

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl rounded-2xl bg-card shadow-search">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search medicine name or salt..."
              className="w-full rounded-2xl border-0 bg-transparent py-4 pl-12 pr-44 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={identifyingImage}
                className="flex items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-2.5 text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                title="Scan medicine with camera"
              >
                {identifyingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <button type="submit" className="rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                Search
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedMedicine ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              {query ? "No medicines found. Try a different search." : "Search for a medicine to compare prices."}
            </p>
          </div>
        ) : (
          <>
            {/* Medicine Header */}
            <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{selectedMedicine.name}</h1>
                  <p className="mt-1 text-muted-foreground">{selectedMedicine.salt_name} · {selectedMedicine.manufacturer}</p>
                  {medicines.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {medicines.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedMedicine(m); loadPrices(m.id); setShowLive(false); setLivePrices([]); fetchAlternatives(m.name, m.salt_name); }}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            m.id === selectedMedicine.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary"
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {sorted.length > 0 && (
                    <>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {showLive ? "Live Best Price" : "Best Price"}
                        </p>
                        <p className="font-heading text-3xl font-bold text-savings">₹{lowest}</p>
                      </div>
                      {savingsPercent > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-savings-soft px-4 py-2 animate-pulse-savings">
                          <TrendingDown className="h-4 w-4 text-savings" />
                          <span className="text-sm font-bold text-savings">Save {savingsPercent}%</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Live Price Button */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => fetchLivePrices()}
                disabled={liveLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
              >
                {liveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching live prices...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    {showLive ? "Refresh Live Prices" : "Get Live Prices from Pharmacies"}
                  </>
                )}
              </button>

              {showLive && !liveLoading && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live prices
                  </span>
                  <button
                    onClick={() => { setShowLive(false); }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Show cached prices
                  </button>
                </div>
              )}
            </div>

            {/* Live loading - show progressive results + remaining skeletons */}
            {liveLoading && (
              <div className="mb-6 space-y-3">
                {livePrices.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ✅ {livePrices.filter(lp => lp.price !== null).length} pharmacy prices loaded, fetching more...
                  </p>
                )}
                {livePrices.length === 0 && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 rounded bg-muted" />
                            <div className="h-3 w-48 rounded bg-muted" />
                          </div>
                          <div className="h-8 w-20 rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <p className="text-center text-sm text-muted-foreground">
                  ⏱ Fetching live prices... Results appear as each pharmacy responds
                </p>
              </div>
            )}

            {/* Side by side: Price Table + Generic Alternatives */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* Price Comparison - Left (3/5) */}
              <div className="lg:col-span-3">
                {(!liveLoading || livePrices.length > 0) && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        Price Comparison ({sorted.length} pharmacies)
                        {showLive && <span className="ml-2 text-xs font-normal text-green-600">· Live</span>}
                      </h2>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="total">Sort: Best Price</option>
                          <option value="rating">Sort: Rating</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {sorted.map((p, i) => {
                        const total = p.price + (p.delivery_charge || 0);
                        const visitUrl = getVisitUrl(
                          p.pharmacies?.slug || "",
                          p.pharmacies?.website_url || null,
                          p.link
                        );
                        return (
                          <div
                            key={p.id}
                            className={`group relative rounded-2xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover animate-fade-in ${
                              i === 0 ? "border-savings/40 ring-1 ring-savings/20" : "border-border"
                            }`}
                            style={{ animationDelay: `${i * 0.06}s` }}
                          >
                            {i === 0 && (
                              <div className="absolute -top-3 left-4 rounded-full bg-gradient-savings px-3 py-0.5 text-xs font-semibold text-savings-foreground">
                                ✨ Best Deal
                              </div>
                            )}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-base font-bold text-secondary-foreground">
                                  {p.pharmacies?.name?.charAt(0) || "?"}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="truncate font-semibold text-foreground">{p.pharmacies?.name}</h3>
                                    <Shield className="h-3.5 w-3.5 shrink-0 text-trust" />
                                    {p.isLive && (
                                      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        LIVE
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-accent text-accent" /> {p.pharmacies?.rating || "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Truck className="h-3 w-3" /> {(p.delivery_charge || 0) === 0 ? "Free" : `₹${p.delivery_charge}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-heading text-xl font-bold text-foreground">₹{total}</p>
                                  {(p.delivery_charge || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">₹{p.price} + ₹{p.delivery_charge}</p>
                                  )}
                                </div>
                                <a
                                  href={visitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                                >
                                  Visit <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      {showLive
                        ? "Live prices · Click Visit to buy"
                        : "Cached prices · Click 'Get Live Prices' for real-time data"}
                    </p>
                  </>
                )}
              </div>

              {/* Generic Alternatives - Right (2/5) */}
              {selectedMedicine && (
                <div className="lg:col-span-2">
                  <div className="sticky top-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                        <FlaskConical className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-heading text-base font-semibold text-foreground">
                          Generic Alternatives
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Same composition · Lower price
                        </p>
                      </div>
                    </div>

                    {alternativesLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                            <div className="space-y-2">
                              <div className="h-4 w-32 rounded bg-muted" />
                              <div className="h-3 w-48 rounded bg-muted" />
                              <div className="h-6 w-20 rounded bg-muted" />
                            </div>
                          </div>
                        ))}
                        <p className="text-center text-xs text-muted-foreground">
                          <Sparkles className="mr-1 inline h-3 w-3" />
                          Finding cheaper alternatives...
                        </p>
                      </div>
                    ) : alternatives.length > 0 ? (
                      <div className="space-y-3">
                        {alternatives.map((alt, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover hover:border-accent/30 animate-fade-in"
                            style={{ animationDelay: `${i * 0.08}s` }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-sm text-foreground">{alt.name}</h3>
                                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                  {alt.manufacturer}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                  {alt.salt_name}
                                </p>
                              </div>
                              {alt.savings_percent > 0 && (
                                <div className="flex shrink-0 items-center gap-1 rounded-full bg-savings-soft px-2 py-1">
                                  <BadgePercent className="h-3 w-3 text-savings" />
                                  <span className="text-xs font-bold text-savings">
                                    {alt.savings_percent}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">
                              {alt.reason}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="font-heading text-lg font-bold text-foreground">
                                ₹{alt.estimated_price}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">MRP</span>
                              </p>
                              <button
                                onClick={() => {
                                  setSearchInput(alt.name);
                                  searchMedicines(alt.name);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
                              >
                                Compare <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-center text-xs text-muted-foreground">
                          <Sparkles className="mr-1 inline h-3 w-3" />
                          AI-suggested · Consult your doctor before switching
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
                        <FlaskConical className="mx-auto h-6 w-6 text-muted-foreground/50" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          No cheaper alternatives found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ComparePage;
