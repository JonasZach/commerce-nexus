import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, FileText, Link2, Search, Shield,
  CheckCircle2, Clock, XCircle, AlertTriangle, Eye, Pencil,
  Users, TrendingUp, MapPin, Tag
} from "lucide-react";
import ImpersonateView from "@/components/admin/ImpersonateView";
import CompanyEditModal from "@/components/admin/CompanyEditModal";

export default function AdminDashboard() {
  const [companies, setCompanies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [impersonating, setImpersonating] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    if (me.role !== "admin") { setIsAdmin(false); setLoading(false); return; }
    setIsAdmin(true);
    const [allCompanies, allRequests, allConnections] = await Promise.all([
      base44.entities.Company.list("-created_date", 500),
      base44.entities.BuyerRequest.list("-created_date", 500),
      base44.entities.ConnectionRequest.list("-created_date", 500),
    ]);
    setCompanies(allCompanies);
    setRequests(allRequests);
    setConnections(allConnections);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="max-w-md mx-auto text-center py-20">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#1B2A4A]">Access Denied</h2>
      <p className="text-slate-500 mt-2">This page is only accessible to admin users.</p>
    </div>
  );

  if (impersonating) return (
    <ImpersonateView
      company={impersonating}
      allCompanies={companies}
      allRequests={requests}
      allConnections={connections}
      onExit={() => setImpersonating(null)}
      onConnectionsChange={loadData}
    />
  );

  const suppliers = companies.filter(c => c.company_type === "supplier");
  const buyers = companies.filter(c => c.company_type === "buyer");
  const activeSuppliers = suppliers.filter(c => c.is_active_member);
  const pendingConnections = connections.filter(c => c.status === "pending");

  const filteredCompanies = companies.filter(c => {
    const matchSearch = !search ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.country?.toLowerCase().includes(search.toLowerCase()) ||
      c.product_type?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.company_type === typeFilter;
    const matchMember = memberFilter === "all" ||
      (memberFilter === "active" && c.is_active_member) ||
      (memberFilter === "free" && !c.is_active_member);
    return matchSearch && matchType && matchMember;
  });

  const filteredRequests = requests.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConnections = connections.filter(c =>
    !search || c.supplier_company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.buyer_company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {editing && (
        <CompanyEditModal
          company={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadData(); }}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#2AA5A0]" /> Master Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Full platform overview — manage all companies, requests, and connections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: companies.length, icon: Building2, color: "bg-blue-50 text-blue-600" },
          { label: "Suppliers", value: suppliers.length, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
          { label: "Buyers", value: buyers.length, icon: Users, color: "bg-green-50 text-green-600" },
          { label: "Active Memberships", value: activeSuppliers.length, icon: Shield, color: "bg-[#2AA5A0]/10 text-[#2AA5A0]" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#1B2A4A]">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="companies">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="companies" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Companies ({filteredCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Requests ({filteredRequests.length})
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Connections ({filteredConnections.length})
          </TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search by name, email, country, product type..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={memberFilter} onValueChange={setMemberFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="active">Active Members</SelectItem>
                <SelectItem value="free">Free Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Companies Table */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Product Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Markets</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Membership</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map(c => {
                    const compConnections = connections.filter(cn =>
                      cn.supplier_company_id === c.id || cn.buyer_company_id === c.id
                    );
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {c.logo_url ? (
                              <img src={c.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1B2A4A] truncate max-w-[160px]">{c.company_name}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[160px]">{c.created_by}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-[10px] ${c.company_type === "supplier" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                            {c.company_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-slate-500">{c.product_type || <span className="text-slate-300">—</span>}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="text-xs text-slate-500 space-y-0.5">
                            {c.email && <p className="truncate max-w-[160px]">{c.email}</p>}
                            {c.phone && <p>{c.phone}</p>}
                            {c.country && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.country}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(c.preferred_markets || []).map(m => (
                              <span key={m} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{m}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {c.is_active_member ? (
                            <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Active</Badge>
                          ) : (
                            <Badge className="text-[10px] bg-slate-100 text-slate-500">Free</Badge>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5">{compConnections.length} conn.</p>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          {c.company_type === "supplier" ? (
                            <div className="text-xs text-slate-500">
                              <p className="capitalize">{(c.membership_plan || "free").replace("_", " ")}</p>
                              {c.membership_end_date && (
                                <p className="text-[10px] text-slate-400">Exp: {new Date(c.membership_end_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(c)}>
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setImpersonating(c)}>
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCompanies.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                  No companies found
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid gap-3">
            {filteredRequests.map(r => (
              <Card key={r.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[#1B2A4A]">{r.title}</p>
                        <Badge className={`text-[10px] ${r.status === "open" ? "bg-green-100 text-green-700" : r.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#2AA5A0] font-medium mt-0.5">{r.company_name}</p>
                      <p className="text-xs text-slate-500 mt-1.5">{r.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                        {r.category && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{r.category}</span>}
                        {r.quantity && <span>Qty: {r.quantity}</span>}
                        {r.budget_range && <span>Budget: {r.budget_range}</span>}
                        <span className="text-slate-300">{new Date(r.created_date).toLocaleDateString()}</span>
                      </div>
                      {r.target_markets?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {r.target_markets.map(m => (
                            <span key={m} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />No requests found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="mt-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search connections..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid gap-3">
            {filteredConnections.map(c => (
              <Card key={c.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="font-medium text-[#1B2A4A]">{c.supplier_company_name}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-medium text-[#1B2A4A]">{c.buyer_company_name}</span>
                      </div>
                      {c.message && <p className="text-xs text-slate-500 mt-1">{c.message}</p>}
                      <p className="text-xs text-slate-300 mt-1">{new Date(c.created_date).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`text-xs shrink-0 ${
                      c.status === "accepted" ? "bg-green-100 text-green-700" :
                      c.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {c.status === "accepted" ? <CheckCircle2 className="w-3 h-3 mr-1 inline" /> :
                       c.status === "rejected" ? <XCircle className="w-3 h-3 mr-1 inline" /> :
                       <Clock className="w-3 h-3 mr-1 inline" />}
                      {c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredConnections.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Link2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />No connections found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}