import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "€0",
    period: "forever",
    desc: "Browse registered companies on the platform",
    features: [
      "View registered companies",
      "Basic company profile",
      "Market presence"
    ],
    limitations: [
      "Cannot view buyer requests",
      "Cannot send connection requests"
    ],
  },
  {
    id: "6_months",
    name: "Active Membership",
    price: "€420",
    period: "6 months",
    desc: "Full access for 6 months",
    features: [
      "View & respond to buyer requests",
      "Send connection requests",
      "Full access to buyer details",
      "Priority visibility"
    ],
    highlight: true,
  },
  {
    id: "12_months",
    name: "Active Membership",
    price: "€720",
    period: "12 months",
    desc: "Best value — save €120",
    features: [
      "Everything in 6-month plan",
      "Save €120 vs two 6-month plans",
      "Extended market exposure",
      "Premium profile badge"
    ],
  },
];

export default function SupplierPlanStep({ selectedPlan, onSelect, onBack, onComplete, saving }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B2A4A]">Choose Your Plan</h2>
        <p className="text-slate-500 mt-1">Select a membership that fits your needs</p>
      </div>

      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <motion.button
            key={plan.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(plan.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative
              ${selectedPlan === plan.id
                ? "border-[#2AA5A0] bg-[#2AA5A0]/5"
                : "border-slate-200 hover:border-slate-300"
              }
              ${plan.highlight ? "ring-1 ring-[#2AA5A0]/20" : ""}
            `}
          >
            {plan.highlight && (
              <span className="absolute -top-2.5 right-4 bg-[#2AA5A0] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Popular
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#1B2A4A]">{plan.price}</span>
                  <span className="text-sm text-slate-400">/ {plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1
                ${selectedPlan === plan.id ? "border-[#2AA5A0] bg-[#2AA5A0]" : "border-slate-300"}
              `}>
                {selectedPlan === plan.id && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
              {plan.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Shield className="w-3.5 h-3.5 text-[#2AA5A0]" /> {f}
                </span>
              ))}
            </div>
            {plan.limitations && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {plan.limitations.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-sm text-slate-400">
                    ✕ {f}
                  </span>
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={!selectedPlan || saving}
          className="bg-[#2AA5A0] hover:bg-[#249691] text-white rounded-full px-6"
        >
          {saving ? "Creating..." : "Complete Registration"}
        </Button>
      </div>

      {selectedPlan && selectedPlan !== "free" && (
        <p className="text-xs text-center text-slate-400">
          Payment will be processed separately. You will receive an invoice via email.
        </p>
      )}
    </div>
  );
}