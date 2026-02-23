import { Search, BarChart3, ExternalLink } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Search Medicine",
    date: "Step 1",
    content: "Enter medicine name, salt, or brand and get instant results from 15+ pharmacies.",
    category: "Search",
    icon: Search,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Compare Prices",
    date: "Step 2",
    content: "See real-time prices with delivery charges, COD availability, and platform ratings.",
    category: "Compare",
    icon: BarChart3,
    relatedIds: [1, 3],
    status: "in-progress" as const,
    energy: 70,
  },
  {
    id: 3,
    title: "Buy at Best Price",
    date: "Step 3",
    content: "Click to visit the pharmacy with the best deal. We redirect you securely.",
    category: "Purchase",
    icon: ExternalLink,
    relatedIds: [2],
    status: "pending" as const,
    energy: 40,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Compare medicine prices in 3 simple steps — click a node to explore
          </p>
        </div>

        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </section>
  );
};

export default HowItWorks;
