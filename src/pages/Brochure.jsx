import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, Globe, Users, CheckCircle, ArrowRight, Sparkles, TrendingUp, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";

const CONTENT = {
  en: {
    tagline: "Your Gateway to Global B2B Trade",
    headline1: "Grow Your Business",
    headline2: "Without Borders",
    sub: "Commerce Nexus connects suppliers and buyers across Cyprus, Greece, Europe, and the Arab world — in just three simple steps.",
    cta: "Start for Free",
    how_title: "How It Works",
    how_sub: "Simple steps to connect with international partners",
    steps: [
      {
        step: "01",
        title: "Register",
        desc: "Create your company profile as a Supplier or Buyer and tell us about your business.",
        detail: "Takes less than 5 minutes. No credit card required.",
      },
      {
        step: "02",
        title: "Discover",
        desc: "Browse companies, post buyer requests, or find suppliers that match your needs.",
        detail: "Access a curated network across 4 key markets and 20+ industries.",
      },
      {
        step: "03",
        title: "Connect",
        desc: "Send connection requests, negotiate deals, and build lasting partnerships.",
        detail: "Real people, real companies, real growth.",
      },
    ],
    why_title: "Why Commerce Nexus?",
    perks: [
      { title: "Verified Companies", desc: "Every profile is reviewed before going live." },
      { title: "Multi-Market Reach", desc: "Cyprus, Greece, Europe & Arabian Countries." },
      { title: "Buyer & Supplier Tools", desc: "Post requests or find the right supplier instantly." },
      { title: "Free to Get Started", desc: "No commitment — upgrade when you're ready." },
    ],
    plans_label: "Supplier Plans",
    plans: [
      { name: "Free", price: "€0", period: "forever", features: ["Browse companies", "Basic profile", "Market presence"] },
      { name: "6 Months Active", price: "€420", period: "6 months", features: ["Respond to buyer requests", "Send connections", "Priority visibility"] },
      { name: "12 Months Active", price: "€720", period: "12 months", features: ["Everything in 6-month", "Save €120", "Premium badge"], highlight: true },
    ],
    footer: `© ${new Date().getFullYear()} Commerce Nexus. All rights reserved.`,
  },
  gr: {
    tagline: "Η Πύλη σας στο Παγκόσμιο B2B Εμπόριο",
    headline1: "Αναπτύξτε την Επιχείρησή σας",
    headline2: "Χωρίς Σύνορα",
    sub: "Το Commerce Nexus συνδέει προμηθευτές και αγοραστές σε Κύπρο, Ελλάδα, Ευρώπη και αραβικό κόσμο — σε μόλις τρία απλά βήματα.",
    cta: "Ξεκινήστε Δωρεάν",
    how_title: "Πώς Λειτουργεί",
    how_sub: "Απλά βήματα για σύνδεση με διεθνείς συνεργάτες",
    steps: [
      {
        step: "01",
        title: "Εγγραφή",
        desc: "Δημιουργήστε το προφίλ της εταιρείας σας ως Προμηθευτής ή Αγοραστής.",
        detail: "Διαρκεί λιγότερο από 5 λεπτά. Δεν απαιτείται κάρτα.",
      },
      {
        step: "02",
        title: "Ανακάλυψη",
        desc: "Περιηγηθείτε σε εταιρείες ή βρείτε προμηθευτές που ταιριάζουν στις ανάγκες σας.",
        detail: "Πρόσβαση σε δίκτυο 4 αγορών και 20+ κλάδων.",
      },
      {
        step: "03",
        title: "Σύνδεση",
        desc: "Στείλτε αιτήματα σύνδεσης και χτίστε μακροχρόνιες συνεργασίες.",
        detail: "Πραγματικές εταιρείες, πραγματική ανάπτυξη.",
      },
    ],
    why_title: "Γιατί Commerce Nexus;",
    perks: [
      { title: "Επαληθευμένες Εταιρείες", desc: "Κάθε προφίλ ελέγχεται πριν δημοσιευτεί." },
      { title: "Πολλαπλές Αγορές", desc: "Κύπρος, Ελλάδα, Ευρώπη & Αραβικές Χώρες." },
      { title: "Εργαλεία για Αγοραστές & Προμηθευτές", desc: "Δημοσιεύστε αιτήματα ή βρείτε προμηθευτή άμεσα." },
      { title: "Δωρεάν Ξεκίνημα", desc: "Χωρίς δέσμευση — αναβαθμίστε όποτε είστε έτοιμοι." },
    ],
    plans_label: "Πλάνα Προμηθευτών",
    plans: [
      { name: "Δωρεάν", price: "€0", period: "για πάντα", features: ["Περιήγηση εταιρειών", "Βασικό προφίλ", "Παρουσία στην αγορά"] },
      { name: "Ενεργό 6 Μήνες", price: "€420", period: "6 μήνες", features: ["Απάντηση αιτημάτων", "Αποστολή συνδέσεων", "Προτεραιότητα εμφάνισης"] },
      { name: "Ενεργό 12 Μήνες", price: "€720", period: "12 μήνες", features: ["Όλα του 6μηνου", "Εξοικονόμηση €120", "Premium διακριτικό"], highlight: true },
    ],
    footer: `© ${new Date().getFullYear()} Commerce Nexus. Με επιφύλαξη παντός δικαιώματος.`,
  },
};

const stepIcons = [Building2, Globe, Users];

export default function Brochure() {
  const [lang, setLang] = React.useState("en");
  const t = CONTENT[lang];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav — logo + lang toggle only, no buttons */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/699c29f5a59121aa54dbc179/82eb061a0_commerce-nexus-logo-400x130.png"
            alt="Commerce Nexus"
            className="h-9 w-auto"
          />

        </div>
      </nav>

      {/* Hero — ad-style banner */}
      <section className="pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-br from-[#1B3A6B] via-[#1e4580] to-[#0f2a55]">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#00AEEF]/10 translate-x-1/2 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/20 text-[#33C1F5] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t.tagline}
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
              {t.headline1}
              <br />
              <span className="text-[#00AEEF]">{t.headline2}</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              {t.sub}
            </p>
            <Link to={createPageUrl("Register")} className="inline-block mt-8">
              <button className="bg-[#00AEEF] hover:bg-[#009ad6] text-white font-semibold rounded-full px-8 py-3.5 text-base transition-all flex items-center gap-2 shadow-lg shadow-[#00AEEF]/30 mx-auto">
                {t.cta} <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="h-1.5 bg-gradient-to-r from-[#1B3A6B] via-[#00AEEF] to-[#1B3A6B]" />

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#00AEEF] text-sm font-semibold uppercase tracking-widest mb-2">Step by Step</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">{t.how_title}</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">{t.how_sub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.steps.map((item, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <span className="text-6xl font-extrabold text-slate-100 absolute top-4 right-6 group-hover:text-[#00AEEF]/10 transition-colors select-none">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-[#00AEEF]/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#00AEEF]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
                  <p className="mt-3 text-xs text-[#00AEEF] font-medium">{item.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Us — perks grid */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#00AEEF] text-sm font-semibold uppercase tracking-widest mb-2">Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">{t.why_title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {t.perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-100 hover:border-[#00AEEF]/30 hover:bg-[#00AEEF]/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0 group-hover:bg-[#00AEEF] transition-colors">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1B2A4A]">{perk.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#00AEEF] text-sm font-semibold uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] tracking-tight">{t.plans_label}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-7 border relative ${
                  plan.highlight
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-xl shadow-[#1B3A6B]/20"
                    : "bg-white border-slate-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#00AEEF] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    <Star className="w-3 h-3" /> Best Value
                  </div>
                )}
                <h3 className={`font-bold text-lg ${plan.highlight ? "text-white" : "text-[#1B2A4A]"}`}>{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-[#1B2A4A]"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-white/50" : "text-slate-400"}`}>/ {plan.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-white/80" : "text-slate-600"}`}>
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-[#00AEEF]" : "text-[#00AEEF]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-[#00AEEF] to-[#1B3A6B] text-white text-center">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <TrendingUp className="w-10 h-10 mx-auto mb-4 text-white/70" />
          <h2 className="text-2xl sm:text-3xl font-bold">{lang === "en" ? "Ready to expand your market reach?" : "Έτοιμοι να επεκτείνετε την αγορά σας;"}</h2>
          <p className="mt-3 text-white/70 max-w-lg mx-auto">{lang === "en" ? "Join Commerce Nexus today and start building the partnerships that grow your business." : "Εγγραφείτε σήμερα και ξεκινήστε να χτίζετε συνεργασίες που αναπτύσσουν την επιχείρησή σας."}</p>
          <Link to={createPageUrl("Register")} className="inline-block mt-6">
            <button className="bg-white text-[#1B3A6B] font-bold rounded-full px-8 py-3.5 hover:bg-slate-100 transition-colors flex items-center gap-2 mx-auto">
              {t.cta} <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 bg-[#1B3A6B] text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src="https://media.base44.com/images/public/699c29f5a59121aa54dbc179/82eb061a0_commerce-nexus-logo-400x130.png"
            alt="Commerce Nexus"
            className="h-7 w-auto brightness-0 invert"
          />
          <p className="text-sm">{t.footer}</p>
          <div className="flex items-center bg-white/10 rounded-full p-1 gap-0.5">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === "en" ? "bg-white text-[#1B3A6B] shadow-sm" : "text-white/50 hover:text-white"}`}
            >EN</button>
            <button
              onClick={() => setLang("gr")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === "gr" ? "bg-white text-[#1B3A6B] shadow-sm" : "text-white/50 hover:text-white"}`}
            >ΕΛ</button>
          </div>
        </div>
      </footer>
    </div>
  );
}