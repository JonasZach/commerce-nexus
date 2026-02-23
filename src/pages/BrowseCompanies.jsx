import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Building2, Globe, MapPin, Filter } from "lucide-react";
import CompanyDetailModal from "@/components/companies/CompanyDetailModal";

export default function BrowseCompanies() {
  const [companies, setCompanies] = useState([]);
  const [myCompany, setMyCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const me = await base44.auth.me();
    const [all, myCompanies] = await Promise.all([
      base44.entities.Company.list("-created_date", 100),
      base44.entities.Company.filter({ created_by: me.email }),
    ]);
    setCompanies(all.filter(c => c.profile_completed));
    if (myCompanies.length > 0) setMyCompany(myCompanies[0]);
    setLoading(false);
  };

  const filtered = companies.filter(c => {
    const matchSearch = !search || c.company_name?.toLowerCase().includes(search.toLowerCase()) || c.business_type?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.company_type === typeFilter;
    const matchMarket = marketFilter === "all" || c.preferred_markets?.includes(marketFilter);
    return matchSearch && matchType && matchMarket;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Browse Companies</h1>
        <p className="text-slate-500 mt-1">Discover suppliers and buyers on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search by company name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="supplier">Suppliers</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="Cyprus">Cyprus</SelectItem>
            <SelectItem value="Greece">Greece</SelectItem>
            <SelectItem value="Europe">Europe</SelectItem>
            <SelectItem value="Arabian Countries">Arabian Countries</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(company => (
          <Card key={company.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                {company.logo_url ? (
                  <img src={company.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#1B2A4A] truncate">{company.company_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        company.company_type === "supplier"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {company.company_type}
                    </Badge>
                    {company.is_active_member && (
                      <Badge variant="secondary" className="text-[10px] bg-[#2AA5A0]/10 text-[#2AA5A0]">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {company.description && (
                <p className="text-sm text-slate-500 mt-3 line-clamp-2">{company.description}</p>
              )}

              <div className="mt-3 space-y-1.5">
                {company.business_type && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Filter className="w-3.5 h-3.5" />
                    <span>{company.business_type}</span>
                  </div>
                )}
                {company.country && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{company.country}</span>
                  </div>
                )}
              </div>

              {company.preferred_markets?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {company.preferred_markets.map(m => (
                    <span key={m} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No companies found matching your filters</p>
        </div>
      )}
    </div>
  );
}