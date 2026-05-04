import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, Save } from "lucide-react";
import SubscriptionCard from "@/components/profile/SubscriptionCard";

const MARKETS = ["Cyprus", "Greece", "Europe", "Arabian Countries"];

export default function Profile() {
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const companies = await base44.entities.Company.filter({ created_by: me.email });
    if (companies.length > 0) {
      setCompany(companies[0]);
      setFormData(companies[0]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...data } = formData;
    await base44.entities.Company.update(company.id, data);
    setSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(p => ({ ...p, logo_url: file_url }));
    setUploading(false);
  };

  const toggleMarket = (market) => {
    const current = formData.preferred_markets || [];
    if (current.includes(market)) {
      setFormData(p => ({ ...p, preferred_markets: current.filter(m => m !== market) }));
    } else {
      setFormData(p => ({ ...p, preferred_markets: [...current, market] }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSupplier = company?.company_type === "supplier";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">Company Profile</h1>

      {/* Subscription Section for Suppliers */}
      {isSupplier && <SubscriptionCard company={company} />}

      {/* Profile Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div>
            <Label>Company Logo</Label>
            <div className="mt-1.5 flex items-center gap-4">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <span className="text-sm text-[#2AA5A0] font-medium hover:underline">
                  {uploading ? "Uploading..." : "Change logo"}
                </span>
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input
                className="mt-1.5"
                value={formData.company_name || ""}
                onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1.5"
                value={formData.email || ""}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1.5"
                value={formData.phone || ""}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                className="mt-1.5"
                value={formData.country || ""}
                onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div>
            <Label className="mb-2 block">Preferred Markets</Label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map(market => (
                <button
                  key={market}
                  type="button"
                  onClick={() => toggleMarket(market)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                    ${(formData.preferred_markets || []).includes(market)
                      ? "bg-[#2AA5A0] text-white border-[#2AA5A0]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#2AA5A0]"
                    }`}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Requests Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-medium text-[#1B2A4A] text-sm">Accept Connection Requests</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.accept_connections === false
                  ? "You are not accepting new connection requests"
                  : "Others can send you connection requests"}
              </p>
            </div>
            <Switch
              checked={formData.accept_connections !== false}
              onCheckedChange={(val) => setFormData(p => ({ ...p, accept_connections: val }))}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1B2A4A] hover:bg-[#243556] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}