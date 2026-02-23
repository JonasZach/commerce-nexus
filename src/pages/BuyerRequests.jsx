import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FileText, Clock, Tag, MapPin, Send, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  "Packaged Food & Beverages",
  "Meat, Dairy, Fruits & Canned Goods",
  "Premium & Delicatessen Products",
  "Industrial Materials",
  "Contractors",
  "Other"
];

const MARKETS = ["Cyprus", "Greece", "Europe", "Arabian Countries"];

export default function BuyerRequests() {
  const [company, setCompany] = useState(null);
  const [requests, setRequests] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const companies = await base44.entities.Company.filter({ created_by: me.email });
    if (companies.length > 0) {
      const comp = companies[0];
      setCompany(comp);

      if (comp.company_type === "buyer") {
        const reqs = await base44.entities.BuyerRequest.filter({ company_id: comp.id }, "-created_date");
        setRequests(reqs);
      } else {
        // Supplier: show all open requests
        if (comp.is_active_member) {
          const [reqs, conns] = await Promise.all([
            base44.entities.BuyerRequest.filter({ status: "open" }, "-created_date"),
            base44.entities.ConnectionRequest.filter({ supplier_company_id: comp.id }),
          ]);
          setRequests(reqs);
          setMyConnections(conns);
        }
      }
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setSaving(true);
    await base44.entities.BuyerRequest.create({
      ...formData,
      target_markets: selectedMarkets,
      company_id: company.id,
      company_name: company.company_name,
      status: "open",
    });
    setFormData({});
    setSelectedMarkets([]);
    setDialogOpen(false);
    setSaving(false);
    loadData();
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
    loadData();
  };

  const alreadyConnected = (request) =>
    myConnections.some(c => c.buyer_request_id === request.id || c.buyer_company_id === request.company_id);

  const toggleMarket = (market) => {
    setSelectedMarkets(prev =>
      prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isBuyer = company?.company_type === "buyer";
  const isSupplier = company?.company_type === "supplier";
  const isFreePlan = isSupplier && !company?.is_active_member;

  if (isFreePlan) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2A4A]">Upgrade Required</h2>
        <p className="text-slate-500 mt-2">
          You need an Active Membership to view and respond to buyer requests.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {isBuyer ? "My Requests" : "Buyer Requests"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isBuyer ? "Create and manage your purchase requests" : "Browse and respond to buyer needs"}
          </p>
        </div>
        {isBuyer && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2AA5A0] hover:bg-[#249691] text-white rounded-full">
                <Plus className="w-4 h-4 mr-2" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Purchase Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g., Looking for organic olive oil supplier"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    className="mt-1.5"
                    rows={3}
                    placeholder="Describe what you need in detail..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category || ""} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., 500 kg"
                      value={formData.quantity || ""}
                      onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Budget Range</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g., €5,000 - €10,000"
                    value={formData.budget_range || ""}
                    onChange={(e) => setFormData(p => ({ ...p, budget_range: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Target Markets</Label>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMarket(m)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all
                          ${selectedMarkets.includes(m)
                            ? "bg-[#2AA5A0] text-white border-[#2AA5A0]"
                            : "bg-white text-slate-600 border-slate-200"
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.title || !formData.description || saving}
                  className="w-full bg-[#1B2A4A] hover:bg-[#243556] text-white"
                >
                  {saving ? "Creating..." : "Create Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {isBuyer ? "No requests yet. Create your first one!" : "No open requests at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <Card key={req.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#1B2A4A]">{req.title}</h3>
                      <Badge
                        className={`text-[10px] ${
                          req.status === "open" ? "bg-green-100 text-green-700" :
                          req.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {req.status}
                      </Badge>
                    </div>
                    {isSupplier && req.company_name && (
                      <p className="text-sm text-[#2AA5A0] font-medium mt-0.5">{req.company_name}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">{req.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
                      {req.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> {req.category}
                        </span>
                      )}
                      {req.quantity && (
                        <span className="flex items-center gap-1">
                          Qty: {req.quantity}
                        </span>
                      )}
                      {req.budget_range && (
                        <span>Budget: {req.budget_range}</span>
                      )}
                    </div>
                    {req.target_markets?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.target_markets.map(m => (
                          <span key={m} className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isSupplier && (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(req)}
                      className="bg-[#2AA5A0] hover:bg-[#249691] text-white rounded-full shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}