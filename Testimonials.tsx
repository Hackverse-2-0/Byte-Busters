import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

const testimonials = [
  {
    text: "Saved ₹1,200/month on my diabetes medicines. PriceMedy shows me the cheapest pharmacy every time!",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    name: "Rajesh Kumar",
    role: "Bhubaneswar, Odisha",
  },
  {
    text: "As a mother of two, medicine costs add up. This platform helped me find generic alternatives I didn't know existed.",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    name: "Priya Sharma",
    role: "Delhi",
  },
  {
    text: "I recommend PriceMedy to my patients. It's transparent, reliable, and helps people afford their treatments.",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    name: "Dr. Anil Patel",
    role: "Mumbai",
  },
  {
    text: "PriceMedy helped me save over ₹900 on blood pressure medicines. The price comparison is incredibly accurate.",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    name: "Sunita Devi",
    role: "Jaipur, Rajasthan",
  },
  {
    text: "Finding affordable alternatives for my parents' medicines was stressful until I discovered this platform.",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    name: "Arjun Nair",
    role: "Kochi, Kerala",
  },
  {
    text: "The generic medicine suggestions alone saved me thousands. Highly recommend to every Indian household.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Meera Iyer",
    role: "Chennai, Tamil Nadu",
  },
  {
    text: "Simple interface, accurate prices, and real savings. PriceMedy is now my go-to before buying any medicine.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Vikram Singh",
    role: "Lucknow, UP",
  },
  {
    text: "As a pharmacist, I appreciate the transparency PriceMedy brings to medicine pricing in India.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Fatima Sheikh",
    role: "Hyderabad, Telangana",
  },
  {
    text: "Comparing prices across 15+ pharmacies in seconds — this is exactly what Indian healthcare needed.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Rohit Gupta",
    role: "Pune, Maharashtra",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="bg-background py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Trusted by Thousands
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Real people saving real money on medicines
          </p>
        </div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[600px]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} duration={19} className="hidden md:block" />
          <TestimonialsColumn testimonials={thirdColumn} duration={17} className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
