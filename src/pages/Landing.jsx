import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Globe, Shield, Zap, Building2, Users, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] flex items-center justify-center">
              <span className="text-[#2AA5A0] font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-lg text-[#1B2A4A] tracking-tight">Commerce Nexus</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuth ? (
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-[#1B2A4A] hover:bg-[#243556] text-white rounded-full px-6">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-[#1B2A4A] hidden sm:flex"
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                >
                  Sign In
                </Button>
                <Link to={createPageUrl("Register")}>
                  <Button className="bg-[#2AA5A0] hover:bg-[#249691] text-white rounded-full px-6">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A]/[0.02] via-transparent to-[#2AA5A0]/[0.03]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-[#2AA5A0]/10 text-[#2AA5A0] rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <Globe className="w-4 h-4" />
              B2B Trade Platform — Cyprus, Greece, Europe & Arab Countries
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B2A4A] leading-tight tracking-tight">
              Connect with the
              <span className="text-[#2AA5A0]"> right partners</span> for your business
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Commerce Nexus bridges suppliers and buyers with speed and transparency. 
              Find reliable commercial partners, access new markets, and grow your business internationally.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-[#1B2A4A] hover:bg-[#243556] text-white rounded-full px-8 h-12 text-base">
                  Register Your Company <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-slate-200">
                  Learn More <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { label: "Markets Covered", value: "4+", icon: Globe },
              { label: "Industries", value: "6+", icon: Building2 },
              { label: "Growing Network", value: "B2B", icon: Users },
              { label: "Active 24/7", value: "Always", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <stat.icon className="w-5 h-5 text-[#2AA5A0] mx-auto mb-3" />
                <p className="text-2xl font-bold text-[#1B2A4A]">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">How it works</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">Simple steps to connect with international partners</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Register",
                desc: "Create your company profile as a Supplier or Buyer and tell us about your business.",
                icon: Building2,
              },
              {
                step: "02",
                title: "Discover",
                desc: "Browse companies, post buyer requests, or find suppliers that match your needs.",
                icon: Globe,
              },
              {
                step: "03",
                title: "Connect",
                desc: "Send connection requests, negotiate deals, and build lasting partnerships.",
                icon: Users,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow"
              >
                <span className="text-5xl font-bold text-slate-100 absolute top-4 right-6 group-hover:text-[#2AA5A0]/10 transition-colors">{item.step}</span>
                <div className="w-12 h-12 rounded-xl bg-[#2AA5A0]/10 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-[#2AA5A0]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1B2A4A] mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier Plans */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">Supplier Plans</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">Choose the plan that fits your business needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "€0",
                period: "forever",
                desc: "Browse registered companies",
                features: ["View registered companies", "Basic company profile", "Market presence"],
                highlight: false,
              },
              {
                name: "Active 6 Months",
                price: "€420",
                period: "6 months",
                desc: "Full access to the platform",
                features: ["View & respond to buyer requests", "Send connection requests", "Priority visibility", "Full company details"],
                highlight: true,
              },
              {
                name: "Active 12 Months",
                price: "€720",
                period: "12 months",
                desc: "Best value for serious suppliers",
                features: ["Everything in 6-month plan", "Save €120 compared to 2× 6-month", "Extended market exposure", "Premium badge"],
                highlight: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-8 border relative ${
                  plan.highlight
                    ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xl shadow-[#1B2A4A]/10"
                    : "bg-white border-slate-200"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2AA5A0] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-lg font-semibold ${plan.highlight ? "" : "text-[#1B2A4A]"}`}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-white/60" : "text-slate-400"}`}>/ {plan.period}</span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlight ? "text-white/60" : "text-slate-500"}`}>{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-white/80" : "text-slate-600"}`}>
                      <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-[#2AA5A0]" : "text-[#2AA5A0]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl("Register")} className="block mt-8">
                  <Button
                    className={`w-full rounded-full h-11 ${
                      plan.highlight
                        ? "bg-[#2AA5A0] hover:bg-[#249691] text-white"
                        : "bg-[#1B2A4A] hover:bg-[#243556] text-white"
                    }`}
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-[#1B2A4A] text-white/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#2AA5A0] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-medium text-white">Commerce Nexus</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Commerce Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}