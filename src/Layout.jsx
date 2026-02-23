import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Link2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS_BUYER = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Browse Companies", page: "BrowseCompanies", icon: Building2 },
  { name: "My Requests", page: "BuyerRequests", icon: FileText },
  { name: "Connections", page: "Connections", icon: Link2 },
];

const NAV_ITEMS_SUPPLIER = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Browse Companies", page: "BrowseCompanies", icon: Building2 },
  { name: "Buyer Requests", page: "BuyerRequests", icon: FileText },
  { name: "Connections", page: "Connections", icon: Link2 },
];

const PUBLIC_PAGES = ["Landing", "Register"];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const me = await base44.auth.me();
        setUser(me);
        const companies = await base44.entities.Company.filter({ created_by: me.email });
        if (companies.length > 0) setCompany(companies[0]);
      }
    } catch (e) {
      // not logged in
    }
    setLoading(false);
  };

  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = company?.company_type === "supplier" ? NAV_ITEMS_SUPPLIER : NAV_ITEMS_BUYER;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <style>{`
        :root {
          --cn-navy: #1B2A4A;
          --cn-navy-light: #243556;
          --cn-teal: #2AA5A0;
          --cn-teal-light: #35C4BE;
          --cn-slate: #F1F5F9;
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#1B2A4A] text-white z-50 
          transform transition-transform duration-300 ease-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/10">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2AA5A0] flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight">Commerce Nexus</span>
              <p className="text-[11px] text-white/50 -mt-0.5">B2B Platform</p>
            </div>
          </Link>
        </div>

        {company && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              {company.logo_url ? (
                <img src={company.logo_url} className="w-8 h-8 rounded-md object-cover" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-md bg-[#2AA5A0]/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#2AA5A0]" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{company.company_name}</p>
                <p className="text-[11px] text-white/40 capitalize">{company.company_type}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${isActive
                    ? "bg-[#2AA5A0] text-white shadow-lg shadow-[#2AA5A0]/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="font-medium">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            to={createPageUrl("Profile")}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${currentPageName === "Profile"
                ? "bg-[#2AA5A0] text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
          >
            <User className="w-[18px] h-[18px]" />
            <span className="font-medium">Profile</span>
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-14 flex items-center px-4 lg:px-6">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1B2A4A] flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-600 hidden sm:block">{user.full_name || user.email}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}