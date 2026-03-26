import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  TrendingUp, TrendingDown, Link2, FileText, Clock, CheckCircle2,
  XCircle, CalendarIcon, ChevronDown, BarChart2, Building2
} from "lucide-react";
import { format, subDays, subMonths, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
];

function getPresetRange(preset) {
  const now = new Date();
  const from = preset.months
    ? subMonths(now, preset.months)
    : subDays(now, preset.days);
  return { from: startOfDay(from), to: endOfDay(now) };
}

function inRange(dateStr, from, to) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return isWithinInterval(d, { start: from, end: to });
}

export default function StatsPanel({ company }) {
  const [activePreset, setActivePreset] = useState(1); // default: 30 days
  const [customRange, setCustomRange] = useState(null); // { from, to }
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pickingFrom, setPickingFrom] = useState(true);
  const [tempFrom, setTempFrom] = useState(null);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isBuyer = company?.company_type === "buyer";

  const getDateRange = useCallback(() => {
    if (customRange?.from && customRange?.to) return customRange;
    return getPresetRange(PRESETS[activePreset]);
  }, [activePreset, customRange]);

  const getRangeLabel = () => {
    if (customRange?.from && customRange?.to) {
      return `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`;
    }
    return PRESETS[activePreset].label;
  };

  const loadStats = useCallback(async () => {
    if (!company) return;
    setLoading(true);

    const { from, to } = getDateRange();

    if (isBuyer) {
      const [requests, connections] = await Promise.all([
        base44.entities.BuyerRequest.filter({ company_id: company.id }),
        base44.entities.ConnectionRequest.filter({ buyer_company_id: company.id }),
      ]);

      const inPeriodRequests = requests.filter(r => inRange(r.created_date, from, to));
      const inPeriodConns = connections.filter(c => inRange(c.created_date, from, to));

      // Previous period for trend comparison
      const periodMs = to - from;
      const prevFrom = new Date(from - periodMs);
      const prevTo = new Date(to - periodMs);
      const prevRequests = requests.filter(r => inRange(r.created_date, prevFrom, prevTo));
      const prevConns = connections.filter(c => inRange(c.created_date, prevFrom, prevTo));

      setStats({
        requestsPosted: inPeriodRequests.length,
        prevRequestsPosted: prevRequests.length,
        connectionsReceived: inPeriodConns.length,
        prevConnectionsReceived: prevConns.length,
        acceptedConnections: inPeriodConns.filter(c => c.status === "accepted").length,
        prevAccepted: prevConns.filter(c => c.status === "accepted").length,
        pendingConnections: inPeriodConns.filter(c => c.status === "pending").length,
        rejectedConnections: inPeriodConns.filter(c => c.status === "rejected").length,
        openRequests: inPeriodRequests.filter(r => r.status === "open").length,
        closedRequests: inPeriodRequests.filter(r => r.status === "closed").length,
        successRate: inPeriodConns.length > 0
          ? Math.round((inPeriodConns.filter(c => c.status === "accepted").length / inPeriodConns.length) * 100)
          : 0,
      });
    } else {
      // Supplier
      const connections = await base44.entities.ConnectionRequest.filter({ supplier_company_id: company.id });
      const requests = company.is_active_member
        ? await base44.entities.BuyerRequest.list("-created_date", 200)
        : [];

      const inPeriodConns = connections.filter(c => inRange(c.created_date, from, to));

      const periodMs = to - from;
      const prevFrom = new Date(from - periodMs);
      const prevTo = new Date(to - periodMs);
      const prevConns = connections.filter(c => inRange(c.created_date, prevFrom, prevTo));

      // Count unique buyers reached
      const uniqueBuyers = new Set(inPeriodConns.map(c => c.buyer_company_id)).size;
      const prevUniqueBuyers = new Set(prevConns.map(c => c.buyer_company_id)).size;

      // Count requests responded to in period
      const requestsRespondedTo = inPeriodConns.filter(c => c.buyer_request_id).length;

      setStats({
        connectionsSent: inPeriodConns.length,
        prevConnectionsSent: prevConns.length,
        acceptedConnections: inPeriodConns.filter(c => c.status === "accepted").length,
        prevAccepted: prevConns.filter(c => c.status === "accepted").length,
        pendingConnections: inPeriodConns.filter(c => c.status === "pending").length,
        rejectedConnections: inPeriodConns.filter(c => c.status === "rejected").length,
        uniqueBuyersReached: uniqueBuyers,
        prevUniqueBuyers,
        requestsRespondedTo,
        successRate: inPeriodConns.length > 0
          ? Math.round((inPeriodConns.filter(c => c.status === "accepted").length / inPeriodConns.length) * 100)
          : 0,
      });
    }

    setLoading(false);
  }, [company, getDateRange, isBuyer]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handlePresetClick = (idx) => {
    setActivePreset(idx);
    setCustomRange(null);
  };

  const handleCalendarSelect = (date) => {
    if (!date) return;
    if (pickingFrom) {
      setTempFrom(date);
      setPickingFrom(false);
    } else {
      if (date < tempFrom) {
        setCustomRange({ from: startOfDay(date), to: endOfDay(tempFrom) });
      } else {
        setCustomRange({ from: startOfDay(tempFrom), to: endOfDay(date) });
      }
      setPickingFrom(true);
      setCalendarOpen(false);
    }
  };

  const Trend = ({ current, previous, suffix = "" }) => {
    if (previous === 0 && current === 0) return <span className="text-xs text-slate-400">No data</span>;
    if (previous === 0) return <span className="text-xs text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> New</span>;
    const pct = Math.round(((current - previous) / previous) * 100);
    const up = pct >= 0;
    return (
      <span className={`text-xs flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {up ? "+" : ""}{pct}%{suffix} vs prev. period
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#00AEEF]" />
          <h2 className="text-lg font-semibold text-[#1B3A6B]">Activity Stats</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePresetClick(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${activePreset === i && !customRange
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#00AEEF] hover:text-[#00AEEF]"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom date picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${customRange?.from && customRange?.to
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#00AEEF] hover:text-[#00AEEF]"
                  }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                {customRange?.from && customRange?.to
                  ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d")}`
                  : "Custom range"}
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <p className="text-xs text-slate-500 mb-2 text-center">
                {pickingFrom ? "Select start date" : `Start: ${format(tempFrom, "MMM d, yyyy")} — now select end date`}
              </p>
              <Calendar
                mode="single"
                selected={pickingFrom ? undefined : tempFrom}
                onSelect={handleCalendarSelect}
                disabled={(date) => date > new Date()}
                initialFocus
              />
              {!pickingFrom && (
                <button
                  className="text-xs text-slate-400 mt-1 hover:text-slate-600 w-full text-center"
                  onClick={() => { setPickingFrom(true); setTempFrom(null); }}
                >
                  Cancel
                </button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Range label */}
      <p className="text-xs text-slate-400">Showing data for: <span className="font-medium text-slate-600">{getRangeLabel()}</span></p>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="h-8 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {isBuyer ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                iconBg="bg-blue-50"
                value={stats.requestsPosted}
                label="Requests Posted"
                trend={<Trend current={stats.requestsPosted} previous={stats.prevRequestsPosted} />}
              />
              <StatCard
                icon={<Link2 className="w-4 h-4 text-[#00AEEF]" />}
                iconBg="bg-[#00AEEF]/10"
                value={stats.connectionsReceived}
                label="Connections Received"
                trend={<Trend current={stats.connectionsReceived} previous={stats.prevConnectionsReceived} />}
              />
              <StatCard
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                iconBg="bg-emerald-50"
                value={stats.acceptedConnections}
                label="Accepted"
                trend={<Trend current={stats.acceptedConnections} previous={stats.prevAccepted} />}
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
                iconBg="bg-purple-50"
                value={`${stats.successRate}%`}
                label="Acceptance Rate"
                trend={null}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Link2 className="w-4 h-4 text-[#00AEEF]" />}
                iconBg="bg-[#00AEEF]/10"
                value={stats.connectionsSent}
                label="Connections Sent"
                trend={<Trend current={stats.connectionsSent} previous={stats.prevConnectionsSent} />}
              />
              <StatCard
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                iconBg="bg-emerald-50"
                value={stats.acceptedConnections}
                label="Deals Accepted"
                trend={<Trend current={stats.acceptedConnections} previous={stats.prevAccepted} />}
              />
              <StatCard
                icon={<Building2 className="w-4 h-4 text-indigo-600" />}
                iconBg="bg-indigo-50"
                value={stats.uniqueBuyersReached}
                label="Unique Buyers Reached"
                trend={<Trend current={stats.uniqueBuyersReached} previous={stats.prevUniqueBuyers} />}
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
                iconBg="bg-purple-50"
                value={`${stats.successRate}%`}
                label="Success Rate"
                trend={null}
              />
            </div>
          )}

          {/* Breakdown row */}
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Pending" value={stats.pendingConnections} color="text-amber-600" bg="bg-amber-50" icon={<Clock className="w-3.5 h-3.5" />} />
            <MiniStat label="Accepted" value={stats.acceptedConnections} color="text-emerald-600" bg="bg-emerald-50" icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
            <MiniStat label="Rejected" value={stats.rejectedConnections} color="text-red-500" bg="bg-red-50" icon={<XCircle className="w-3.5 h-3.5" />} />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, iconBg, value, label, trend }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-[#1B3A6B]">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {trend && <div className="mt-2">{trend}</div>}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, color, bg, icon }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${color}`}>
          {icon}
        </div>
        <div>
          <p className={`text-lg font-bold ${color}`}>{value}</p>
          <p className="text-[11px] text-slate-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}