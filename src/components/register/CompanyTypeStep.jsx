import React from "react";
import { Building2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyTypeStep({ onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1B2A4A]">Join Commerce Nexus</h2>
        <p className="text-slate-500 mt-2">What best describes your company?</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { type: "supplier", label: "Supplier", desc: "I supply products or services to businesses", icon: Building2 },
          { type: "buyer", label: "Buyer", desc: "I'm looking to buy products or services", icon: ShoppingCart },
        ].map((item) => (
          <motion.button
            key={item.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(item.type)}
            className="p-6 rounded-2xl border-2 border-slate-200 hover:border-[#2AA5A0] transition-colors text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2AA5A0]/10 flex items-center justify-center mb-4 group-hover:bg-[#2AA5A0]/20 transition-colors">
              <item.icon className="w-6 h-6 text-[#2AA5A0]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B2A4A]">{item.label}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}