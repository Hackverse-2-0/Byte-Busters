import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-sm font-bold text-primary-foreground">P</span>
              </div>
              <span className="font-heading text-lg font-bold text-foreground">
                Price<span className="text-primary">Medy</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's smartest medicine price comparison platform. We help you find the cheapest prices across 15+ pharmacies.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-foreground">Compare</h4>
            <ul className="space-y-2">
              {["Diabetes Medicines", "BP Medicines", "Heart Medicines", "Fever & Pain", "Thyroid"].map((item) => (
                <li key={item}>
                  <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Blog", "Contact", "Careers"].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Disclaimer", "Affiliate Disclosure"].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 PriceMedy. We do not sell medicines. We help you compare prices across online pharmacies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
