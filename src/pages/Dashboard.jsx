import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Building2,
  FileText,
  Link2,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({ requests: 0, connections: 0, pending: 0 });
  const [recentConnections, setRecentConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const companies = await base44.entities.Company.filter({ created_by: me.email });

    if (companies.length === 0) {
      if (me.role === "admin") {
        // Admin with no company — redirect to admin panel
        navigate(createPageUrl("AdminDashboard"));
        return;
      }
      navigate(createPageUrl("Register"));
      return;
    }

    const comp = companies[0];
    setCompany(comp);

    if (comp.company_type === "buyer") {
      const requests = await base44.entities.BuyerRequest.filter({ company_id: comp.id });
      const connections = await base44.entities.ConnectionRequest.filter({ buyer_company_id: comp.id });
      setStats({
        requests: requests.length,
        connections: connections.filter(c => c.status === "accepted").length,
        pending: connections.filter(c => c.status === "pending").length,
      });
      setRecentConnections(connections.slice(0, 5));
    } else {
      const connections = await base44.entities.ConnectionRequest.filter({ supplier_company_id: comp.id });
      setStats({
        requests: 0,
        connections: connections.filter(c => c.status === "accepted").length,
        pending: connections.filter(c => c.status === "pending").length,
      });
      setRecentConnections(connections.slice(0, 5));
    }

    setLoading(false);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Welcome back, {company?.company_name}
        </h1>
        <p className="text-slate-500 mt-1">
          {isBuyer ? "Manage your purchase requests and connections" : "Find buyers and grow your business"}
        </p>
      </div>

      {/* Free plan banner for suppliers */}
      {isFreePlan && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">You're on the Free plan</p>
              <p className="text-sm text-amber-600">Upgrade to view buyer requests and connect with buyers.</p>
            </div>
            <Link to={createPageUrl("Profile")}>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
                Upgrade Plan
              </Button>
            </Link>
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

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        {isBuyer && (
          <Link to={createPageUrl("BuyerRequests")}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2AA5A0]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#2AA5A0]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1B2A4A]">Create a Request</p>
                    <p className="text-sm text-slate-500">Post what you need to buy</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2AA5A0] transition-colors" />
              </CardContent>
            </Card>
          </Link>
        )}
        <Link to={createPageUrl("BrowseCompanies")}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1B2A4A]" />
                </div>
                <div>
                  <p className="font-medium text-[#1B2A4A]">Browse Companies</p>
                  <p className="text-sm text-slate-500">Discover potential partners</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2AA5A0] transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Connections */}
      {recentConnections.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-[#1B2A4A]">Recent Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentConnections.map(conn => (
                <div key={conn.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-[#1B2A4A]">
                      {isBuyer ? conn.supplier_company_name : conn.buyer_company_name}
                    </p>
                    {conn.message && <p className="text-xs text-slate-400 truncate max-w-xs">{conn.message}</p>}
                  </div>
                  <Badge
                    className={`text-xs ${
                      conn.status === "accepted" ? "bg-green-100 text-green-700" :
                      conn.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {conn.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}