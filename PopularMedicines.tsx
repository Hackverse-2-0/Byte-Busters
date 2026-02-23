import { Link } from "react-router-dom";
import { TrendingDown, ArrowRight } from "lucide-react";

const medicines = [
  { name: "Zincovit", salt: "Multivitamin & Multimineral", lowest: 89, highest: 198, savings: 55, category: "Vitamins" },
  { name: "Dolo 650", salt: "Paracetamol 650mg", lowest: 26, highest: 42, savings: 38, category: "Fever" },
  { name: "Azithral 500", salt: "Azithromycin 500mg", lowest: 67, highest: 119, savings: 44, category: "Antibiotic" },
  { name: "Glycomet 500", salt: "Metformin 500mg", lowest: 15, highest: 45, savings: 67, category: "Diabetes" },
  { name: "Pan 40", salt: "Pantoprazole 40mg", lowest: 32, highest: 78, savings: 59, category: "Gastric" },
  { name: "Shelcal 500", salt: "Calcium & Vitamin D3", lowest: 115, highest: 185, savings: 38, category: "Vitamins" },
];

const PopularMedicines = () => {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
              Top Savings Today
            </h2>
            <p className="text-muted-foreground">Most searched medicines with biggest price differences</p>
          </div>
          <Link to="/compare" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med, i) => (
            <Link
              to={`/compare?q=${encodeURIComponent(med.name)}`}
              key={med.name}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {med.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{med.salt}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {med.category}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-savings">₹{med.lowest}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{med.highest}</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-savings-soft px-2.5 py-1">
                  <TrendingDown className="h-3.5 w-3.5 text-savings" />
                  <span className="text-sm font-semibold text-savings">{med.savings}% off</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularMedicines;
