import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to a backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  via-white ">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 px-4">
        <div className="max-w-6xl mx-auto bg-card/80 backdrop-blur-md rounded-full shadow-xl px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:gap-4 transition-all">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <h1 className="fancy-heading text-3xl text-foreground">

          Clip Crew

        </h1>
          </button>
          <div className="flex gap-4 items-center">
            <button onClick={() => navigate("/about")} className="text-muted-foreground hover:text-foreground font-medium">
              About
            </button>
            <Button onClick={() => navigate("/login")} className="bg-primary text-primary-foreground hover: hover: rounded-full px-6 text-white"
            >
              Login

            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
<h1 className="fancy-heading text-5xl md:text-6xl font-bold mb-6">
  Get in{" "}
  <span className="bg-primary text-primary-foreground bg-clip-text text-transparent">
    Touch
  </span>
</h1>        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have a question or need help? We'd love to hear from you. Reach out to our team anytime.
        </p>
      </section>

     
        {/* Contact Info Cards */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

  {/* Email */}
  <div className="bg-muted rounded-[32px] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

    <div className="w-12 h-12 bg-card/50 rounded-xl flex items-center justify-center mb-4">
      <Mail className="w-6 h-6 text-cyan-600" />
    </div>

    <h3 className="fancy-heading text-3xl font-bold text-foreground mb-4">
      Email
    </h3>

    <p className="text-muted-foreground mb-2">
      We'll respond within 24 hours
    </p>

    <p className="font-semibold text-cyan-700">
      support@clipcrew.com
    </p>

  </div>

  {/* Phone */}
  <div className="bg-muted rounded-[32px] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

    <div className="w-12 h-12 bg-card/50 rounded-xl flex items-center justify-center mb-4">
      <Phone className="w-6 h-6 text-primary" />
    </div>

    <h3 className="fancy-heading text-3xl font-bold text-foreground mb-4">
      Phone
    </h3>

    <p className="text-muted-foreground mb-2">
      Mon-Fri, 9am-6pm EST
    </p>

    <p className="font-semibold text-primary">
      +91 8050693918
    </p>

  </div>

  {/* Address */}
  <div className="bg-muted rounded-[32px] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

    <div className="w-12 h-12 bg-card/50 rounded-xl flex items-center justify-center mb-4">
      <MapPin className="w-6 h-6 text-primary" />
    </div>

    <h3 className="fancy-heading text-3xl font-bold text-foreground mb-4">
      Address
    </h3>

    <p className="text-foreground leading-relaxed">
      Bull Temple Road <br />
      Basavanagudi, Bangalore <br />
      560017, India
    </p>

  </div>

</div>

      {/* Contact Form */}
      <section className="bg-muted py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="fancy-heading text-5xl font-bold text-center mb-12">
  Send us a{" "}
  <span className="bg-primary text-primary-foreground bg-clip-text text-transparent">
    Message
  </span>
</h2>
          
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Message Sent!</h3>
              <p className="text-green-700">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card/70 backdrop-blur-md rounded-[40px] shadow-xl p-10 border border-white/50"
            >
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full rounded-2xl border border-border bg-card/80 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
                <div className="mb-6">
  <label className="block text-sm font-semibold text-foreground mb-2">
    Email
  </label>

  <Input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="your@email.com"
    required
    className="w-full rounded-2xl border border-border bg-card/80 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
  />
</div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                  className="w-full rounded-2xl border border-border bg-card/80 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={6}
                  className="w-full rounded-2xl border border-border bg-card/80 px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover: hover: hover: text-white rounded-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                Send Message <Send className="w-5 h-5" />
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="fancy-heading text-5xl font-bold text-center mb-12">
  Frequently Asked{" "}
  <span className="bg-primary text-primary-foreground bg-clip-text text-transparent">
    Questions
  </span>
</h2>
        <div className="space-y-6">
          {[
            {
              q: "How do I hire a professional on Clip Crew?",
              a: "Browse our categories, view professional portfolios, check ratings and reviews, and book them directly through our platform.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, digital wallets, and bank transfers for your convenience.",
            },
            {
              q: "Is there a guarantee if I'm not satisfied?",
              a: "Yes! We offer a satisfaction guarantee. If you're not happy with the work, we'll help resolve it or provide a refund.",
            },
            {
              q: "How do I become a professional on Clip Crew?",
              a: "Sign up as a creator, complete your profile, upload your portfolio, and get verified. Then you're ready to accept bookings!",
            },
            {
              q: "Are there any hidden fees?",
              a: "No! All pricing is transparent. We charge a small commission on bookings, but there are no hidden fees.",
            },
            {
              q: "What if I need to reschedule a booking?",
              a: "Contact the professional directly or use our messaging system. We have flexible rescheduling policies.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-card/70 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-lg font-bold text-foreground mb-3">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-primary text-primary-foreground rounded-[40px] text-white text-center p-16 shadow-xl">
          <h3 className="text-3xl font-bold mb-4">Can't Find the Answer?</h3>
          <p className="text-blue-100 mb-8">
            Check out our help center or reach out to our support team directly.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-card text-blue-600 hover:bg-muted px-8 py-3 text-lg font-semibold"
          >
            Visit Help Center
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
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