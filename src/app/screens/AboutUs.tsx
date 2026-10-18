import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Users, Target, Zap } from "lucide-react";
import { Button } from "../components/ui/button";

const values = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community First",
    description: "We believe in building a strong community of talented creators and satisfied clients.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Quality & Excellence",
    description: "Every professional on our platform is vetted to ensure top-tier quality work.",
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Transparent Pricing",
    description: "No hidden fees. Fair rates that benefit both clients and creative professionals.",
  },
];



export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br  via-white ">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 px-4">
        <div className="max-w-6xl mx-auto bg-card/80 backdrop-blur-md rounded-full shadow-xl px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:gap-4 transition-all">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Clip Crew</h1>
          </button>
          <div className="flex gap-4 items-center">
            <button onClick={() => navigate("/contact")} className="text-muted-foreground hover:text-foreground font-medium">
              Contact
            </button>
            <Button onClick={() => navigate("/login")} className="bg-primary text-primary-foreground hover: hover: rounded-full px-6 text-white">
              Login
            </Button>
          </div>
        </div>
      </nav>

      

      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
  <h2 className="fancy-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
  Empowering Creative{" "}
  <span className="bg-primary text-primary-foreground bg-clip-text text-transparent">
    Professionals
  </span>
</h2>

  <p className="text-xl text-muted-foreground leading-relaxed">
    Clip Crew is designed to bridge the gap between talented creators and clients.
    Our platform helps photographers, designers, makeup artists, and videographers
    showcase their skills while helping clients discover trusted professionals.
  </p>
</section>

      {/* Values Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
       <h2 className="fancy-heading text-5xl font-bold text-foreground mb-4 text-center">Our Core Values</h2>
        <p className="text-muted-foreground text-center mb-12 text-lg">
          These principles guide everything we do at Clip Crew
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, idx) => (
            <div key={idx} className={`p-8 rounded-[32px] shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-2 ${
  idx === 0
    ? "bg-muted"
    : idx === 1
    ? "bg-muted"
    : "bg-muted"
}`}>
              <div className="text-primary mb-4">{value.icon}</div>
              <h3 className="fancy-heading text-3xl font-bold text-foreground mb-4">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      
     

      {/* Why Choose Us */}
      <section className="bg-muted py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="fancy-heading text-5xl font-bold text-foreground mb-12 text-center">Why Choose Clip Crew?</h2>
          <div className="space-y-4">
            {[
              "Verified and vetted creative professionals",
              "Transparent pricing with no hidden fees",
              "Secure payment and project management",
              "24/7 customer support",
              "Dispute resolution and guarantees",
              "Portfolio verification and ratings",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 bg-card/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all">
                <Check className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-lg text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-primary text-primary-foreground rounded-[40px] text-white text-center p-16 shadow-xl">
          <h3 className="fancy-heading text-5xl font-bold mb-6">Join the Clip Crew Community</h3>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Whether you're a client looking for professionals or a creative pro ready to grow your business, we'd love to have you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => navigate("/login")}
              className="px-8 py-3 text-lg border-2 border-white text-white hover:bg-card/10 rounded-full font-semibold"
              >
              Browse Professionals
            </Button>
            <Button
              onClick={() => navigate("/register")}
              variant="outline"
              className="px-8 py-3 text-lg border-2 border-white text-white hover:bg-card/10 rounded-full font-semibold"
              >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8 mt-20">
  <div className="max-w-6xl mx-auto px-6 text-center">
    <h3 className="fancy-heading text-3xl mb-3">Clip Crew</h3>

    <p className="text-slate-400 mb-4">
      Connecting clients with creative professionals.
    </p>

    <div className="border-t border-slate-700 pt-4">
      <p className="text-slate-500 text-sm">
        © 2026 Clip Crew. All rights reserved.
      </p>
    </div>
  </div>
</footer>
    </div>
  );
}