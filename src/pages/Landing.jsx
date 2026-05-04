import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Globe, Shield, Zap, Building2, Users, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CONTENT = {
  en: {
    badge: "B2B Trade Platform — Cyprus, Greece, Europe & Arab Countries",
    hero_h1_1: "Connect with the",
    hero_h1_accent: " right partners",
    hero_h1_2: " for your business",
    hero_p: "Commerce Nexus bridges suppliers and buyers with speed and transparency. Find reliable commercial partners, access new markets, and grow your business internationally.",
    hero_cta1: "Register Your Company",
    hero_cta2: "Learn More",
    stats: [
      { label: "Markets Covered", value: "4+" },
      { label: "Industries", value: "6+" },
      { label: "Growing Network", value: "B2B" },
      { label: "Active 24/7", value: "Always" },
    ],
    how_title: "How it works",
    how_sub: "Simple steps to connect with international partners",
    steps: [
      { step: "01", title: "Register", desc: "Create your company profile as a Supplier or Buyer and tell us about your business." },
      { step: "02", title: "Discover", desc: "Browse companies, post buyer requests, or find suppliers that match your needs." },
      { step: "03", title: "Connect", desc: "Send connection requests, negotiate deals, and build lasting partnerships." },
    ],
    plans_title: "Supplier Plans",
    plans_sub: "Choose the plan that fits your business needs",
    plans: [
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
        highlight: false,
      },
      {
        name: "Active 12 Months",
        price: "€720",
        period: "12 months",
        desc: "Best value for serious suppliers",
        features: ["Everything in 6-month plan", "Save €120 compared to 2× 6-month", "Extended market exposure", "Premium badge"],
        highlight: true,
        popular: "Most Popular",
      },
    ],
    get_started: "Get Started",
    sign_in: "Sign In",
    dashboard: "Go to Dashboard",
    footer: `© ${new Date().getFullYear()} Commerce Nexus. All rights reserved.`,
  },
  gr: {
    badge: "Πλατφόρμα B2B Εμπορίου — Κύπρος, Ελλάδα, Ευρώπη & Αραβικές Χώρες",
    hero_h1_1: "Συνδεθείτε με τους",
    hero_h1_accent: " κατάλληλους συνεργάτες",
    hero_h1_2: " για την επιχείρησή σας",
    hero_p: "Το Commerce Nexus συνδέει προμηθευτές και αγοραστές με ταχύτητα και διαφάνεια. Βρείτε αξιόπιστους εμπορικούς εταίρους, αποκτήστε πρόσβαση σε νέες αγορές και αναπτύξτε την επιχείρησή σας διεθνώς.",
    hero_cta1: "Εγγραφή Εταιρείας",
    hero_cta2: "Μάθετε Περισσότερα",
    stats: [
      { label: "Αγορές", value: "4+" },
      { label: "Κλάδοι", value: "6+" },
      { label: "Αναπτυσσόμενο Δίκτυο", value: "B2B" },
      { label: "Ενεργό 24/7", value: "Πάντα" },
    ],
    how_title: "Πώς λειτουργεί",
    how_sub: "Απλά βήματα για σύνδεση με διεθνείς συνεργάτες",
    steps: [
      { step: "01", title: "Εγγραφή", desc: "Δημιουργήστε το προφίλ της εταιρείας σας ως Προμηθευτής ή Αγοραστής." },
      { step: "02", title: "Ανακάλυψη", desc: "Περιηγηθείτε σε εταιρείες, δημοσιεύστε αιτήματα ή βρείτε προμηθευτές που ταιριάζουν." },
      { step: "03", title: "Σύνδεση", desc: "Στείλτε αιτήματα σύνδεσης, διαπραγματευτείτε και χτίστε μακροχρόνιες συνεργασίες." },
    ],
    plans_title: "Πλάνα Προμηθευτών",
    plans_sub: "Επιλέξτε το πλάνο που ταιριάζει στις ανάγκες σας",
    plans: [
      {
        name: "Δωρεάν",
        price: "€0",
        period: "για πάντα",
        desc: "Περιήγηση σε εγγεγραμμένες εταιρείες",
        features: ["Προβολή εγγεγραμμένων εταιρειών", "Βασικό προφίλ εταιρείας", "Παρουσία στην αγορά"],
        highlight: false,
      },
      {
        name: "Ενεργό 6 Μήνες",
        price: "€420",
        period: "6 μήνες",
        desc: "Πλήρης πρόσβαση στην πλατφόρμα",
        features: ["Προβολή & απάντηση αιτημάτων αγοραστών", "Αποστολή αιτημάτων σύνδεσης", "Προτεραιότητα εμφάνισης", "Πλήρη στοιχεία εταιρείας"],
        highlight: false,
      },
      {
        name: "Ενεργό 12 Μήνες",
        price: "€720",
        period: "12 μήνες",
        desc: "Καλύτερη αξία για σοβαρούς προμηθευτές",
        features: ["Όλα του 6μηνου πλάνου", "Εξοικονόμηση €120 έναντι 2× 6μηνου", "Εκτεταμένη έκθεση στην αγορά", "Premium διακριτικό"],
        highlight: true,
        popular: "Πιο Δημοφιλές",
      },
    ],
    get_started: "Ξεκινήστε",
    sign_in: "Σύνδεση",
    dashboard: "Πίνακας Ελέγχου",
    footer: `© ${new Date().getFullYear()} Commerce Nexus. Με επιφύλαξη παντός δικαιώματος.`,
  },
};

export default function Landing() {
  const [isAuth, setIsAuth] = React.useState(false);
  const [lang, setLang] = React.useState("en");

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const t = CONTENT[lang];
  const stepIcons = [Building2, Globe, Users];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/699c29f5a59121aa54dbc179/82eb061a0_commerce-nexus-logo-400x130.png" alt="Commerce Nexus" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 gap-0.5">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === "en" ? "bg-white text-[#1B3A6B] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("gr")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === "gr" ? "bg-white text-[#1B3A6B] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                ΕΛ
              </button>
            </div>

            {isAuth ? (
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-[#1B2A4A] hover:bg-[#243556] text-white rounded-full px-6">
                  {t.dashboard} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-[#1B2A4A] hidden sm:flex"
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                >
                  {t.sign_in}
                </Button>
                <Link to={createPageUrl("Register")}>
                  <Button className="bg-[#00AEEF] hover:bg-[#009ad6] text-white rounded-full px-6">
                    {t.get_started} <ArrowRight className="w-4 h-4 ml-2" />
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
            key={lang}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 text-[#00AEEF] rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <Globe className="w-4 h-4" />
              {t.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B2A4A] leading-tight tracking-tight">
              {t.hero_h1_1}
              <span className="text-[#00AEEF]">{t.hero_h1_accent}</span>
              {t.hero_h1_2}
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t.hero_p}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-[#1B3A6B] hover:bg-[#162f58] text-white rounded-full px-8 h-12 text-base">
                  {t.hero_cta1} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-slate-200">
                  {t.hero_cta2} <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            key={lang + "-stats"}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {t.stats.map((stat, i) => {
              const Icon = [Globe, Building2, Users, TrendingUp][i];
              return (
                <div key={i} className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Icon className="w-5 h-5 text-[#00AEEF] mx-auto mb-3" />
                  <p className="text-2xl font-bold text-[#1B2A4A]">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">{t.how_title}</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">{t.how_sub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.steps.map((item, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow"
                >
                  <span className="text-5xl font-bold text-slate-100 absolute top-4 right-6 group-hover:text-[#2AA5A0]/10 transition-colors">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-[#00AEEF]/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#00AEEF]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1B2A4A] mb-2">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supplier Plans */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">{t.plans_title}</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">{t.plans_sub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-8 border relative ${
                  plan.highlight
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-xl shadow-[#1B3A6B]/10"
                    : "bg-white border-slate-200"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00AEEF] text-white text-xs font-medium px-3 py-1 rounded-full">
                    {plan.popular}
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
                      <Shield className="w-4 h-4 mt-0.5 shrink-0 text-[#00AEEF]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl("Register")} className="block mt-8">
                  <Button
                    className={`w-full rounded-full h-11 ${
                      plan.highlight
                        ? "bg-[#00AEEF] hover:bg-[#009ad6] text-white"
                        : "bg-[#1B3A6B] hover:bg-[#162f58] text-white"
                    }`}
                  >
                    {t.get_started} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-[#1B3A6B] text-white/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/699c29f5a59121aa54dbc179/82eb061a0_commerce-nexus-logo-400x130.png" alt="Commerce Nexus" className="h-8 w-auto brightness-0 invert" />
          </div>
          <p className="text-sm">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}