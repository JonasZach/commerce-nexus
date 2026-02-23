import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, Globe, Filter, X, Link2, CheckCircle2 } from "lucide-react";

export default function CompanyDetailModal({ company, viewerCompany, onClose }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");

  if (!company) return null;

  const isSupplierViewer = viewerCompany?.company_type === "supplier";
  const isActiveSupplier = isSupplierViewer && viewerCompany?.is_active_member;
  const isBuyerViewer = viewerCompany?.company_type === "buyer";

  // Buyers can see supplier details; active suppliers can see all details
  const canSeeDetails = isBuyerViewer || isActiveSupplier;

  // Active suppliers can connect with buyers
  const canConnect = isActiveSupplier && company.company_type === "buyer";

  const handleConnect = async () => {
    setConnecting(true);
    await base44.entities.ConnectionRequest.create({
      supplier_company_id: viewerCompany.id,
      supplier_company_name: viewerCompany.company_name,
      buyer_company_id: company.id,
      buyer_company_name: company.company_name,
      message: message || undefined,
    });
    setConnecting(false);
    setConnected(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start gap-3">
          {company.logo_url ? (
            <img src={company.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-[#1B2A4A] leading-tight">{company.company_name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge variant="secondary" className={`text-[10px] ${company.company_type === "supplier" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                {company.company_type}
              </Badge>
              {company.is_active_member && (
                <Badge variant="secondary" className="text-[10px] bg-[#2AA5A0]/10 text-[#2AA5A0]">Active Member</Badge>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {company.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{company.description}</p>
          )}

          {/* Contact details — visible to buyers and active suppliers */}
          {canSeeDetails ? (
            <div className="space-y-2.5 bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact Details</p>
              {company.email && (
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-[#2AA5A0] shrink-0" />
                  <a href={`mailto:${company.email}`} className="hover:text-[#2AA5A0] transition-colors">{company.email}</a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-[#2AA5A0] shrink-0" />
                  <a href={`tel:${company.phone}`} className="hover:text-[#2AA5A0] transition-colors">{company.phone}</a>
                </div>
              )}
              {company.country && (
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-[#2AA5A0] shrink-0" />
                  <span>{company.country}</span>
                </div>
              )}
              {company.business_type && (
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Filter className="w-4 h-4 text-[#2AA5A0] shrink-0" />
                  <span>{company.business_type}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
              🔒 Upgrade to an Active Membership to view full contact details.
            </div>
          )}

          {/* Markets */}
          {company.preferred_markets?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Preferred Markets</p>
              <div className="flex flex-wrap gap-1.5">
                {company.preferred_markets.map(m => (
                  <span key={m} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Connect button for active suppliers viewing a buyer */}
          {canConnect && (
            <div className="pt-2 border-t border-slate-100">
              {connected ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Connection request sent!
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#2AA5A0]/30"
                    rows={2}
                    placeholder="Add a message (optional)..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <Button
                    className="w-full bg-[#1B2A4A] hover:bg-[#243556] text-white gap-2"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    <Link2 className="w-4 h-4" />
                    {connecting ? "Sending..." : "Send Connection Request"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}