import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  X, Building2, FileText, Link2, Clock, ArrowRight,
  AlertTriangle, CheckCircle2, XCircle, Eye, Send
} from "lucide-react";

export default function ImpersonateView({ company, allCompanies, allRequests, allConnections, onExit, onConnectionsChange }) {
  const isBuyer = company.company_type === "buyer";
  const isSupplier = company.company_type === "supplier";
  const isFreePlan = isSupplier && !company.is_active_member;
  const [connecting, setConnecting] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter data as this company would see it
  const myRequests = isBuyer
    ? allRequests.filter(r => r.company_id === company.id)
    : [];

  const openRequests = isSupplier && !isFreePlan
    ? allRequests.filter(r => r.status === "open")
    : [];

  const myConnections = isBuyer
    ? allConnections.filter(c => c.buyer_company_id === company.id)
    : allConnections.filter(c => c.supplier_company_id === company.id);

  const stats = {
    requests: isBuyer ? myRequests.length : openRequests.length,
    connections: myConnections.filter(c => c.status === "accepted").length,
    pending: myConnections.filter(c => c.status === "pending").length,
  };

  // Companies visible: all except own
  const visibleCompanies = allCompanies.filter(c => c.id !== company.id);

  const alreadyConnected = (requestOrBuyerId) => {
    const id = typeof requestOrBuyerId === "string" ? requestOrBuyerId : requestOrBuyerId.company_id;
    return myConnections.some(c => c.buyer_company_id === id || c.buyer_request_id === requestOrBuyerId?.id);
  };

  const handleConnect = async (request) => {
    setConnecting(request.id);
    await base44.entities.ConnectionRequest.create({
      supplier_company_id: company.id,
      supplier_company_name: company.company_name,
      buyer_company_id: request.company_id,
      buyer_company_name: request.company_name,
      buyer_request_id: request.id,
      message: `Interested in your request: ${request.title}`,
      status: "pending",
    });
    setConnecting(null);
    if (onConnectionsChange) onConnectionsChange();
  };

  const handleAction = async (connId, status) => {
    setActionLoading(connId);
    await base44.entities.ConnectionRequest.update(connId, { status });
    setActionLoading(null);
    if (onConnectionsChange) onConnectionsChange();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Impersonate Banner */}
      <div className="flex items-center gap-3 bg-[#1B2A4A] text-white px-4 py-3 rounded-xl">
        <Eye className="w-4 h-4 text-[#2AA5A0] shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">Viewing as: </span>
          <span className="text-sm text-[#2AA5A0] font-semibold">{company.company_name}</span>
          <span className="text-xs text-white/50 ml-2 capitalize">({company.company_type}{isFreePlan ? " · free plan" : company.is_active_member ? " · active" : ""})</span>
        </div>
        <Button size="sm" variant="outline" onClick={onExit} className="text-white border-white/20 hover:bg-white/10 gap-1.5 shrink-0">
          <X className="w-3.5 h-3.5" /> Exit View
        </Button>
      </div>

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Welcome back, {company.company_name}</h1>
        <p className="text-slate-500 mt-1">
          {isBuyer ? "Manage your purchase requests and connections" : "Find buyers and grow your business"}
        </p>
      </div>

      {/* Free plan banner */}
      {isFreePlan && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">You're on the Free plan</p>
              <p className="text-sm text-amber-600">Upgrade to view buyer requests and connect with buyers.</p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isBuyer && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B2A4A]">{stats.requests}</p>
                <p className="text-sm text-slate-500">My Requests</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{stats.connections}</p>
              <p className="text-sm text-slate-500">Active Connections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{stats.pending}</p>
              <p className="text-sm text-slate-500">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for pages this user would see */}
      <Tabs defaultValue={isBuyer ? "requests" : "buyer-requests"}>
        <TabsList className="bg-slate-100">
          {isBuyer && (
            <TabsTrigger value="requests" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> My Requests
            </TabsTrigger>
          )}
          {isSupplier && !isFreePlan && (
            <TabsTrigger value="buyer-requests" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Buyer Requests ({openRequests.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="companies" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Companies
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Connections
          </TabsTrigger>
        </TabsList>

        {/* Buyer: My Requests */}
        {isBuyer && (
          <TabsContent value="requests" className="mt-4">
            {myRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p>No requests posted yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {myRequests.map(r => (
                  <Card key={r.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-sm text-[#1B2A4A]">{r.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                          <div className="flex gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                            {r.category && <span>🏷 {r.category}</span>}
                            {r.quantity && <span>Qty: {r.quantity}</span>}
                            {r.budget_range && <span>Budget: {r.budget_range}</span>}
                          </div>
                        </div>
                        <Badge className={`text-[10px] shrink-0 ${r.status === "open" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                          {r.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* Supplier: Buyer Requests */}
        {isSupplier && !isFreePlan && (
          <TabsContent value="buyer-requests" className="mt-4">
            <div className="grid gap-3">
              {openRequests.map(r => (
                <Card key={r.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm text-[#1B2A4A]">{r.title}</p>
                    <p className="text-xs text-[#2AA5A0] font-medium mt-0.5">{r.company_name}</p>
                    <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                      {r.category && <span>🏷 {r.category}</span>}
                      {r.quantity && <span>Qty: {r.quantity}</span>}
                      {r.budget_range && <span>Budget: {r.budget_range}</span>}
                    </div>
                    {r.target_markets?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.target_markets.map(m => (
                          <span key={m} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{m}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Companies */}
        <TabsContent value="companies" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleCompanies.map(c => (
              <Card key={c.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1B2A4A] truncate">{c.company_name}</p>
                      <Badge variant="secondary" className={`text-[10px] ${c.company_type === "supplier" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                        {c.company_type}
                      </Badge>
                    </div>
                  </div>
                  {c.description && <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>}
                  <div className="text-xs text-slate-400 space-y-0.5">
                    {c.country && <p>📍 {c.country} · {c.business_type}</p>}
                    {c.email && <p>✉ {c.email}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections" className="mt-4">
          {myConnections.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Link2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p>No connections yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {myConnections.map(c => (
                <Card key={c.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">
                        {isBuyer ? c.supplier_company_name : c.buyer_company_name}
                      </p>
                      {c.message && <p className="text-xs text-slate-400 mt-0.5">{c.message}</p>}
                    </div>
                    <Badge className={`text-xs shrink-0 ${
                      c.status === "accepted" ? "bg-green-100 text-green-700" :
                      c.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {c.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}