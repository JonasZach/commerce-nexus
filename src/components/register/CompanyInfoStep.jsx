import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BUSINESS_TYPES = [
  "Packaged Food & Beverages",
  "Meat, Dairy, Fruits & Canned Goods",
  "Premium & Delicatessen Products",
  "Industrial Materials",
  "Contractors",
  "Technology",
  "Logistics",
  "Consulting",
  "Other"
];

const MARKETS = ["Cyprus", "Greece", "Europe", "Arabian Countries"];

const COUNTRIES = [
  "Cyprus", "Greece", "Germany", "France", "Italy", "Spain", "Portugal",
  "United Kingdom", "Netherlands", "Belgium", "Austria", "Switzerland",
  "Poland", "Czech Republic", "Romania", "Bulgaria", "Hungary",
  "Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman", "Jordan",
  "Lebanon", "Egypt", "Turkey", "China", "India", "USA", "Canada", "Other"
];

export default function CompanyInfoStep({ data, onChange, onNext, onBack }) {
  const [uploading, setUploading] = React.useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange({ logo_url: file_url });
    setUploading(false);
  };

  const toggleMarket = (market) => {
    const current = data.preferred_markets || [];
    if (current.includes(market)) {
      onChange({ preferred_markets: current.filter(m => m !== market) });
    } else {
      onChange({ preferred_markets: [...current, market] });
    }
  };

  const isValid = data.company_name && data.business_type && data.country && data.email && data.phone && data.description && (data.preferred_markets?.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B2A4A]">Company Details</h2>
        <p className="text-slate-500 mt-1">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        {/* Logo */}
        <div>
          <Label>Company Logo</Label>
          <div className="mt-1.5 flex items-center gap-4">
            {data.logo_url ? (
              <img src={data.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <span className="text-sm text-[#2AA5A0] font-medium hover:underline">
                {uploading ? "Uploading..." : "Upload logo"}
              </span>
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Company Name *</Label>
            <Input
              className="mt-1.5"
              value={data.company_name || ""}
              onChange={(e) => onChange({ company_name: e.target.value })}
              placeholder="Your company name"
            />
          </div>
          <div>
            <Label>Type of Company *</Label>
            <Select value={data.business_type || ""} onValueChange={(v) => onChange({ business_type: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Country of Headquarters *</Label>
            <Select value={data.country || ""} onValueChange={(v) => onChange({ country: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              className="mt-1.5"
              type="email"
              value={data.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="company@example.com"
            />
          </div>
        </div>

        <div>
          <Label>Phone Number *</Label>
          <Input
            className="mt-1.5"
            value={data.phone || ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+357 ..."
          />
        </div>

        <div>
          <Label>Company Description *</Label>
          <Textarea
            className="mt-1.5"
            rows={3}
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="A few sentences about your company, what you do, and what you're looking for..."
          />
        </div>

        <div>
          <Label className="mb-2 block">Preferred Markets *</Label>
          <div className="flex flex-wrap gap-3">
            {MARKETS.map(market => (
              <button
                key={market}
                type="button"
                onClick={() => toggleMarket(market)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                  ${(data.preferred_markets || []).includes(market)
                    ? "bg-[#2AA5A0] text-white border-[#2AA5A0]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#2AA5A0]"
                  }`}
              >
                {market}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-[#1B2A4A] hover:bg-[#243556] text-white rounded-full px-6"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}