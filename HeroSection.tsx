import { useState, useRef } from "react";
import { Search, TrendingDown, Shield, Zap, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import InteractiveNeuralVortex from "@/components/ui/interactive-neural-vortex-background";



const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [identifyingImage, setIdentifyingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdentifyingImage(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("identify-medicine", {
        body: { imageBase64: base64 },
      });
      if (error || !data?.medicineName) {
        toast({ title: "Could not identify medicine", description: "Try a clearer image.", variant: "destructive" });
      } else {
        setQuery(data.medicineName);
        navigate(`/compare?q=${encodeURIComponent(data.medicineName)}`);
      }
    } catch {
      toast({ title: "Error", description: "Failed to process image.", variant: "destructive" });
    }
    setIdentifyingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/compare?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const popularSearches = ["Paracetamol", "Azithromycin", "Metformin", "Atorvastatin", "Pantoprazole", "Zincovit", "Shelcal 500", "Dolo 650", "Crocin", "Amoxicillin", "Cetirizine", "Omeprazole"];

  const titleWords = ["Compare", "Medicine", "Prices"];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-background">
      {/* Neural Vortex Background */}
      <div className="absolute inset-0">
        <InteractiveNeuralVortex className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-savings/20 bg-savings-soft px-4 py-1.5"
          >
            <TrendingDown className="h-4 w-4 text-savings" />
            <span className="text-sm font-medium text-savings">Save up to 85% on medicines</span>
          </motion.div>

          {/* Animated Title */}
          <h1 className="mb-2 font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
            {titleWords.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={letterIndex}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-foreground"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.span
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 150, damping: 25 }}
            className="block mb-6 font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
          >
            Instantly
          </motion.span>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8 max-w-lg mx-auto text-lg text-muted-foreground"
          >
            Search any medicine and compare prices across 15+ pharmacies.
            Find the cheapest option with delivery charges included.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onSubmit={handleSearch}
            className="relative mb-6 max-w-xl mx-auto"
          >
            <div className="relative rounded-2xl bg-card shadow-search border border-border backdrop-blur-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicine name, salt, or brand..."
                className="w-full rounded-2xl border-0 bg-transparent py-4 pl-12 pr-32 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  title="Scan medicine image"
                >
                  {identifyingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                >
                  Search
                </button>
              </div>
            </div>
          </motion.form>

          {/* Popular Searches */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularSearches.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); navigate(`/compare?q=${encodeURIComponent(s)}`); }}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                {s}
              </button>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-10 flex items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-trust" />
              <span className="text-sm text-muted-foreground">Verified Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Real-time Updates</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
