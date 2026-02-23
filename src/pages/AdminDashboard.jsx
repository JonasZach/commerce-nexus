import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Building2, FileText, Link2, Users, Search,
  Shield, CheckCircle2, Clock, XCircle, MapPin, Filter, AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const [companies, setCompanies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    if (me.role !== "admin") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);

    const [allCompanies, allRequests, allConnections] = await Promise.all([
      base44.entities.Company.list("-created_date", 200),
      base44.entities.BuyerRequest.list("-created_date", 200),
      base44.entities.ConnectionRequest.list("-created_date", 200),
    ]);

    setCompanies(allCompanies);
    setRequests(allRequests);
    setConnections(allConnections);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2A4A]">Access Denied</h2>
        <p className="text-slate-500 mt-2">This page is only accessible to admin users.</p>
      </div>
    );
  }

  const suppliers = companies.filter(c => c.company_type === "supplier");
  const buyers = companies.filter(c => c.company_type === "buyer");
  const activeSuppliers = suppliers.filter(c => c.is_active_member);
  const pendingConnections = connections.filter(c => c.status === "pending");

  const filteredCompanies = companies.filter(c =>
    !search || c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.business_type?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#2AA5A0]" /> Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Full platform overview — all companies, requests, and connections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: companies.length, icon: Building2, color: "bg-blue-50 text-blue-600" },
          { label: "Active Suppliers", value: activeSuppliers.length, icon: Shield, color: "bg-green-50 text-green-600" },
          { label: "Buyer Requests", value: requests.length, icon: FileText, color: "bg-purple-50 text-purple-600" },
          { label: "Pending Connections", value: pendingConnections.length, icon: Clock, color: "bg-amber-50 text-amber-600" },
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-10" placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <TabsContent value="companies" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map(c => (
              <Card key={c.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {c.logo_url ? (
                      <img src={c.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1B2A4A] truncate text-sm">{c.company_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className={`text-[10px] ${c.company_type === "supplier" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                          {c.company_type}
                        </Badge>
                        {c.is_active_member && (
                          <Badge variant="secondary" className="text-[10px] bg-[#2AA5A0]/10 text-[#2AA5A0]">Active</Badge>
                        )}
                        {c.membership_plan && c.company_type === "supplier" && (
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 capitalize">
                            {c.membership_plan.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {c.description && <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>}
                  <div className="space-y-1 text-xs text-slate-400">
                    {c.email && <p>✉ {c.email}</p>}
                    {c.phone && <p>📞 {c.phone}</p>}
                    {c.country && <p>📍 {c.country} · {c.business_type}</p>}
                    <p className="text-slate-300">Registered by: {c.created_by}</p>
                  </div>
                  {c.preferred_markets?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.preferred_markets.map(m => (
                        <span key={m} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  )}
                  {c.membership_end_date && (
                    <p className="text-[10px] text-slate-400">
                      Membership expires: {new Date(c.membership_end_date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-4">
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
                        {r.category && <span>🏷 {r.category}</span>}
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
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                No requests found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="mt-4">
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
                <Link2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                No connections found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}