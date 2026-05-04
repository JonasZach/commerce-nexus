import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, Building2 } from "lucide-react";

const MARKETS = ["Cyprus", "Greece", "Europe", "Arabian Countries"];
const PRODUCT_TYPES = [
  "Agro & Agriculture", "Apparel & Fashion", "Arts, Crafts & Gifts",
  "Automotive & Automobile", "Chemicals", "Computer & IT",
  "Construction & Real Estate", "Electronics & Electrical", "Energy & Power",
  "Food & Beverage", "Furniture & Decor", "Health & Medical",
  "Home Appliances", "Lights & Lighting", "Machinery & Industrial Supplies",
  "Minerals & Raw Materials", "Office Supplies", "Paper, Printing & Packaging",
  "Rubber & Plastic Products", "Security & Protection", "Sports & Entertainment",
  "Textiles Leather & Jute", "Tools & Hardware"
];

export default function CompanyEditModal({ company, onClose, onSaved }) {
  const [form, setForm] = useState({ ...company });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleMarket = (m) => {
    const cur = form.preferred_markets || [];
    set("preferred_markets", cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...data } = form;
    await base44.entities.Company.update(company.id, data);
    setSaving(false);
    onSaved();
  };

  const isSupplier = form.company_type === "supplier";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1B3A6B]" />
            {company.company_name}
            <Badge className={`text-[10px] ml-1 ${isSupplier ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
              {form.company_type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Company Name</Label>
              <Input className="mt-1 h-8 text-sm" value={form.company_name || ""} onChange={e => set("company_name", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input className="mt-1 h-8 text-sm" value={form.email || ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input className="mt-1 h-8 text-sm" value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Country</Label>
              <Input className="mt-1 h-8 text-sm" value={form.country || ""} onChange={e => set("country", e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs">Product / Service Type</Label>
            <Select value={form.product_type || ""} onValueChange={v => set("product_type", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea className="mt-1 text-sm" rows={2} value={form.description || ""} onChange={e => set("description", e.target.value)} />
          </div>

          {/* Preferred Markets */}
          <div>
            <Label className="text-xs mb-2 block">Preferred Markets</Label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map(m => (
                <button key={m} type="button" onClick={() => toggleMarket(m)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all
                    ${(form.preferred_markets || []).includes(m)
                      ? "bg-[#2AA5A0] text-white border-[#2AA5A0]"
                      : "bg-white text-slate-500 border-slate-200"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier-only fields */}
          {isSupplier && (
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Membership</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Plan</Label>
                  <Select value={form.membership_plan || "free"} onValueChange={v => set("membership_plan", v)}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="12_months">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input type="date" className="mt-1 h-8 text-sm" value={form.membership_start_date || ""} onChange={e => set("membership_start_date", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input type="date" className="mt-1 h-8 text-sm" value={form.membership_end_date || ""} onChange={e => set("membership_end_date", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1B3A6B]">Active Member</p>
                  <p className="text-xs text-slate-400">Grant full access to buyer requests</p>
                </div>
                <Switch checked={!!form.is_active_member} onCheckedChange={v => set("is_active_member", v)} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-medium text-[#1B3A6B]">Accept Connection Requests</p>
              <p className="text-xs text-slate-400">Allow others to send connection requests</p>
            </div>
            <Switch checked={form.accept_connections !== false} onCheckedChange={v => set("accept_connections", v)} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} className="bg-[#1B3A6B] hover:bg-[#162f58] text-white">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}