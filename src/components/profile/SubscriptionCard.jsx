import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, Calendar, CreditCard, CheckCircle2, AlertTriangle,
  Clock, ArrowUpCircle, Save
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function SubscriptionCard({ company }) {
  const [cardData, setCardData] = useState({
    card_holder: company.card_holder || "",
    card_last4: company.card_last4 || "",
    card_expiry: company.card_expiry || "",
    card_brand: company.card_brand || "",
  });
  const [editingCard, setEditingCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const isActive = company.is_active_member;
  const endDate = company.membership_end_date ? new Date(company.membership_end_date) : null;
  const startDate = company.membership_start_date ? new Date(company.membership_start_date) : null;
  const daysLeft = endDate ? differenceInDays(endDate, new Date()) : null;

  const planLabel = {
    free: "Free Plan",
    "6_months": "Active — 6 Months",
    "12_months": "Active — 12 Months",
  }[company.membership_plan] || "Free Plan";

  const planPrice = {
    free: "€0",
    "6_months": "€420",
    "12_months": "€720",
  }[company.membership_plan] || "€0";

  const handleSaveCard = async () => {
    setSaving(true);
    await base44.entities.Company.update(company.id, cardData);
    setSaving(false);
    setEditingCard(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00AEEF]" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Current Plan */}
        <div className="rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Current Plan</p>
              <p className="text-xl font-bold text-[#1B3A6B]">{planLabel}</p>
              <p className="text-sm text-slate-500 mt-0.5">{planPrice}{company.membership_plan !== "free" ? " one-time" : "/forever"}</p>
            </div>
            {isActive ? (
              <Badge className="bg-green-100 text-green-700 shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-500 shrink-0">Free</Badge>
            )}
          </div>

          {/* Dates */}
          {isActive && (
            <div className="grid sm:grid-cols-2 gap-3">
              {startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#00AEEF]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#00AEEF]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Started</p>
                    <p className="font-medium text-[#1B3A6B]">{format(startDate, "MMM d, yyyy")}</p>
                  </div>
                </div>
              )}
              {endDate && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${daysLeft <= 30 ? "bg-amber-50" : "bg-slate-100"}`}>
                    <Clock className={`w-4 h-4 ${daysLeft <= 30 ? "text-amber-500" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Expires</p>
                    <p className={`font-medium ${daysLeft <= 30 ? "text-amber-600" : "text-[#1B3A6B]"}`}>
                      {format(endDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Days remaining bar */}
          {isActive && daysLeft !== null && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Time remaining</span>
                <span className={daysLeft <= 30 ? "text-amber-600 font-medium" : "font-medium text-[#1B3A6B]"}>
                  {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${daysLeft <= 30 ? "bg-amber-400" : "bg-[#00AEEF]"}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (daysLeft / (company.membership_plan === "6_months" ? 180 : 365)) * 100))}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Expiry warning */}
          {isActive && daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your subscription expires in <strong>{daysLeft} days</strong>. Contact us to renew and keep access to buyer requests.
              </p>
            </div>
          )}

          {!isActive && (
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <ArrowUpCircle className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                Upgrade to an Active Membership to access buyer requests and connect with buyers across all markets.
              </p>
            </div>
          )}
        </div>

        {/* Payment / Card Details */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1B3A6B] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Payment Details
            </p>
            {!editingCard && (
              <button
                onClick={() => setEditingCard(true)}
                className="text-xs text-[#00AEEF] hover:underline font-medium"
              >
                {cardData.card_last4 ? "Update" : "Add card"}
              </button>
            )}
          </div>

          {!editingCard ? (
            cardData.card_last4 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#1B3A6B] to-[#00AEEF] text-white">
                <CreditCard className="w-6 h-6 opacity-80" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{cardData.card_holder || "Card Holder"}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {cardData.card_brand ? `${cardData.card_brand} ` : ""}•••• •••• •••• {cardData.card_last4}
                  </p>
                </div>
                <p className="text-xs opacity-70">{cardData.card_expiry}</p>
              </div>
            ) : (
              <div
                onClick={() => setEditingCard(true)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 cursor-pointer hover:border-[#00AEEF] hover:text-[#00AEEF] transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <p className="text-sm">No card on file — click to add</p>
              </div>
            )
          ) : (
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Card Holder Name</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="John Smith"
                    value={cardData.card_holder}
                    onChange={(e) => setCardData(p => ({ ...p, card_holder: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Card Brand</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="Visa / Mastercard"
                    value={cardData.card_brand}
                    onChange={(e) => setCardData(p => ({ ...p, card_brand: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Last 4 Digits</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="4242"
                    maxLength={4}
                    value={cardData.card_last4}
                    onChange={(e) => setCardData(p => ({ ...p, card_last4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Expiry (MM/YY)</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="08/27"
                    value={cardData.card_expiry}
                    onChange={(e) => setCardData(p => ({ ...p, card_expiry: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Only the last 4 digits and expiry are stored — no full card numbers.</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveCard} disabled={saving} className="bg-[#1B3A6B] hover:bg-[#162f58] text-white">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingCard(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}