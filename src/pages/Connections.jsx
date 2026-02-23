import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2, XCircle, Clock, Link2, Building2, Mail, Phone, MapPin, Filter
} from "lucide-react";
import ConfirmDialog from "../components/connections/ConfirmDialog.jsx";

export default function Connections() {
  const [company, setCompany] = useState(null);
  const [connections, setConnections] = useState([]);
  const [buyerDetails, setBuyerDetails] = useState({}); // id -> company object
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { connId, action: 'accepted'|'rejected' }

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const companies = await base44.entities.Company.filter({ created_by: me.email });
    if (companies.length > 0) {
      const comp = companies[0];
      setCompany(comp);

      let conns;
      if (comp.company_type === "buyer") {
        conns = await base44.entities.ConnectionRequest.filter({ buyer_company_id: comp.id }, "-created_date");
      } else {
        conns = await base44.entities.ConnectionRequest.filter({ supplier_company_id: comp.id }, "-created_date");
        // For active suppliers, load buyer details for all connections
        if (comp.is_active_member && conns.length > 0) {
          const uniqueBuyerIds = [...new Set(conns.map(c => c.buyer_company_id).filter(Boolean))];
          const details = {};
          await Promise.all(uniqueBuyerIds.map(async (id) => {
            try {
              const result = await base44.entities.Company.get(id);
              if (result) details[id] = result;
            } catch (e) {
              // company not found, skip
            }
          }));
          setBuyerDetails(details);
        }
      }
      setConnections(conns);
    }
    setLoading(false);
  };

  const handleAction = async (connId, status) => {
    await base44.entities.ConnectionRequest.update(connId, { status });
    setConfirm(null);
    loadData();
  };

  const requestConfirm = (connId, action) => {
    setConfirm({ connId, action });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isBuyer = company?.company_type === "buyer";
  const isActiveSupplier = !isBuyer && company?.is_active_member;
  const pending = connections.filter(c => c.status === "pending");
  const accepted = connections.filter(c => c.status === "accepted");
  const rejected = connections.filter(c => c.status === "rejected");

  const ConnectionCard = ({ conn }) => {
    const otherName = isBuyer ? conn.supplier_company_name : conn.buyer_company_name;
    const buyerInfo = !isBuyer ? buyerDetails[conn.buyer_company_id] : null;

    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {buyerInfo?.logo_url ? (
                  <img src={buyerInfo.logo_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                ) : (
                  <Building2 className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#1B2A4A]">{otherName}</h3>
                {conn.message && <p className="text-sm text-slate-500 mt-1 italic">"{conn.message}"</p>}

                {/* Buyer details visible to active suppliers */}
                {isActiveSupplier && buyerInfo && (
                  <div className="mt-2 space-y-1.5 bg-slate-50 rounded-lg p-3">
                    {buyerInfo.description && (
                      <p className="text-xs text-slate-600 mb-2">{buyerInfo.description}</p>
                    )}
                    {buyerInfo.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-[#2AA5A0]" />
                        <a href={`mailto:${buyerInfo.email}`} className="hover:text-[#2AA5A0]">{buyerInfo.email}</a>
                      </div>
                    )}
                    {buyerInfo.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-[#2AA5A0]" />
                        <a href={`tel:${buyerInfo.phone}`} className="hover:text-[#2AA5A0]">{buyerInfo.phone}</a>
                      </div>
                    )}
                    {buyerInfo.country && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-[#2AA5A0]" />
                        <span>{buyerInfo.country}{buyerInfo.business_type ? ` · ${buyerInfo.business_type}` : ""}</span>
                      </div>
                    )}
                    {buyerInfo.preferred_markets?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {buyerInfo.preferred_markets.map(m => (
                          <span key={m} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  {new Date(conn.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Buyer accepts/rejects supplier requests */}
              {conn.status === "pending" && isBuyer && (
                <>
                  <Button size="sm" onClick={() => requestConfirm(conn.id, "accepted")} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => requestConfirm(conn.id, "rejected")} className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </>
              )}
              {/* Active supplier accepts/rejects buyer connections */}
              {conn.status === "pending" && isActiveSupplier && (
                <>
                  <Button size="sm" onClick={() => requestConfirm(conn.id, "accepted")} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => requestConfirm(conn.id, "rejected")} className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </>
              )}
              {conn.status === "pending" && !isBuyer && !isActiveSupplier && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" /> Waiting
                </Badge>
              )}
              {conn.status === "accepted" && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                </Badge>
              )}
              {conn.status === "rejected" && (
                <Badge className="bg-red-100 text-red-700 text-xs">
                  <XCircle className="w-3 h-3 mr-1" /> Rejected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Connections</h1>
        <p className="text-slate-500 mt-1">
          {isBuyer ? "Manage connection requests from suppliers" : "Track your connection requests to buyers"}
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted ({accepted.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No pending connections</p>
            </div>
          ) : pending.map(c => <ConnectionCard key={c.id} conn={c} />)}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-3 mt-4">
          {accepted.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No accepted connections yet</p>
            </div>
          ) : accepted.map(c => <ConnectionCard key={c.id} conn={c} />)}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3 mt-4">
          {rejected.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No rejected connections</p>
            </div>
          ) : rejected.map(c => <ConnectionCard key={c.id} conn={c} />)}
        </TabsContent>
      </Tabs>

      {confirm && (
        <ConfirmDialog
          action={confirm.action}
          onConfirm={() => handleAction(confirm.connId, confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}