const stats = [
  { value: "15+", label: "Pharmacies Compared" },
  { value: "50K+", label: "Medicines Listed" },
  { value: "₹2Cr+", label: "Saved by Users" },
  { value: "4.8★", label: "User Rating" },
];

const StatsBar = () => {
  return (
    <section className="border-y border-border bg-card py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
