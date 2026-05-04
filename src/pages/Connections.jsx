import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

const T = {
  en: {
    title: "Connections", buyerSub: "Manage connection requests from suppliers", supplierSub: "Track your connection requests to buyers",
    pending: "Pending", accepted: "Accepted", rejected: "Rejected",
    noPending: "No pending connections", noAccepted: "No accepted connections yet", noRejected: "No rejected connections",
    accept: "Accept", reject: "Reject", waiting: "Waiting", connected: "Connected",
    contactDetails: "Contact Details",
    received: "Received", sent: "Sent",
    noReceived: "No received requests", noSent: "No sent requests",
    receivedSub: "Requests waiting for your response", sentSub: "Requests you sent — waiting for their response",
  },
  gr: {
    title: "Συνδέσεις", buyerSub: "Διαχείριση αιτημάτων σύνδεσης από προμηθευτές", supplierSub: "Παρακολούθηση αιτημάτων σύνδεσης προς αγοραστές",
    pending: "Εκκρεμή", accepted: "Αποδεκτά", rejected: "Απορριφθέντα",
    noPending: "Δεν υπάρχουν εκκρεμή", noAccepted: "Δεν υπάρχουν αποδεκτές συνδέσεις", noRejected: "Δεν υπάρχουν απορριφθέντα",
    accept: "Αποδοχή", reject: "Απόρριψη", waiting: "Αναμονή", connected: "Συνδεδεμένο",
    contactDetails: "Στοιχεία Επικοινωνίας",
    received: "Ληφθέντα", sent: "Απεσταλμένα",
    noReceived: "Δεν υπάρχουν ληφθέντα αιτήματα", noSent: "Δεν υπάρχουν απεσταλμένα αιτήματα",
    receivedSub: "Αιτήματα που αναμένουν την απάντησή σας", sentSub: "Αιτήματα που στείλατε — αναμένετε απάντηση",
  },
};
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2, XCircle, Clock, Link2, Building2, Mail, Phone, MapPin, Filter
} from "lucide-react";
import ConfirmDialog from "../components/connections/ConfirmDialog.jsx";

export default function Connections() {
  const { lang } = useLang();
  const t = T[lang];
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
      }

      // Load the other company's details for ALL accepted connections
      const acceptedConns = conns.filter(c => c.status === "accepted");
      if (acceptedConns.length > 0) {
        const isBuyerComp = comp.company_type === "buyer";
        // For buyers: other party is always the supplier. For suppliers: other party is always the buyer.
        const uniqueIds = [...new Set(acceptedConns.map(c =>
          isBuyerComp ? c.supplier_company_id : c.buyer_company_id
        ).filter(Boolean))];
        const details = {};
        await Promise.all(uniqueIds.map(async (id) => {
          try {
            const result = await base44.entities.Company.get(id);
            if (result) details[id] = result;
          } catch (e) {}
        }));
        setBuyerDetails(details);
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

  // Split pending by who initiated:
  // "received" = someone else initiated → you need to respond
  // "sent" = you initiated → waiting for their response
  const pendingReceived = pending.filter(c => {
    if (isBuyer) return c.initiated_by_type === "supplier" || !c.initiated_by_type; // supplier sent to buyer
    return c.initiated_by_type === "buyer"; // buyer sent to supplier
  });
  const pendingSent = pending.filter(c => {
    if (isBuyer) return c.initiated_by_type === "buyer"; // buyer initiated
    return c.initiated_by_type === "supplier" || !c.initiated_by_type; // supplier initiated (default)
  });

  const ConnectionCard = ({ conn }) => {
    // The "other" party is always the one that is NOT the current company
    const otherName = isBuyer ? conn.supplier_company_name : conn.buyer_company_name;
    const otherId = isBuyer ? conn.supplier_company_id : conn.buyer_company_id;
    const otherInfo = conn.status === "accepted" ? buyerDetails[otherId] : null;

    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {otherInfo?.logo_url ? (
                  <img src={otherInfo.logo_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                ) : (
                  <Building2 className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#1B2A4A]">{otherName}</h3>
                {conn.message && <p className="text-sm text-slate-500 mt-1 italic">"{conn.message}"</p>}

                {/* Show contact details for accepted connections — both buyers and suppliers */}
                {conn.status === "accepted" && otherInfo && (
                  <div className="mt-3 space-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{t.contactDetails}</p>
                    {otherInfo.product_type && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="text-[#2AA5A0] font-medium">🏷</span>
                        <span>{otherInfo.product_type}</span>
                      </div>
                    )}
                    {otherInfo.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-[#2AA5A0] shrink-0" />
                        <a href={`mailto:${otherInfo.email}`} className="hover:text-[#2AA5A0]">{otherInfo.email}</a>
                      </div>
                    )}
                    {otherInfo.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-[#2AA5A0] shrink-0" />
                        <a href={`tel:${otherInfo.phone}`} className="hover:text-[#2AA5A0]">{otherInfo.phone}</a>
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
              {/* Show accept/reject if this connection was received (initiated by the other party) */}
              {conn.status === "pending" && pendingReceived.includes(conn) && (
                <>
                  <Button size="sm" onClick={() => requestConfirm(conn.id, "accepted")} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t.accept}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => requestConfirm(conn.id, "rejected")} className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> {t.reject}
                  </Button>
                </>
              )}
              {/* Waiting badge for sent requests */}
              {conn.status === "pending" && pendingSent.includes(conn) && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" /> {t.waiting}
                </Badge>
              )}
              {conn.status === "accepted" && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {t.connected}
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
        <h1 className="text-2xl font-bold text-[#1B2A4A]">{t.title}</h1>
        <p className="text-slate-500 mt-1">
          {isBuyer ? t.buyerSub : t.supplierSub}
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {t.pending} ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t.accepted} ({accepted.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> {t.rejected} ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-6">
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t.noPending}</p>
            </div>
          ) : (
            <>
              {/* Received — needs user's response */}
              {pendingReceived.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-[#1B2A4A]">{t.received}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{pendingReceived.length}</span>
                    <span className="text-xs text-slate-400 ml-1">— {t.receivedSub}</span>
                  </div>
                  <div className="space-y-3">{pendingReceived.map(c => <ConnectionCard key={c.id} conn={c} />)}</div>
                </div>
              )}

              {/* Sent — waiting for the other party */}
              {pendingSent.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-[#1B2A4A]">{t.sent}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{pendingSent.length}</span>
                    <span className="text-xs text-slate-400 ml-1">— {t.sentSub}</span>
                  </div>
                  <div className="space-y-3">{pendingSent.map(c => <ConnectionCard key={c.id} conn={c} />)}</div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-3 mt-4">
          {accepted.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t.noAccepted}</p>
            </div>
          ) : accepted.map(c => <ConnectionCard key={c.id} conn={c} />)}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3 mt-4">
          {rejected.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t.noRejected}</p>
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