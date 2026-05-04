import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
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
import { useLang } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";

const PUBLIC_PAGES = ["Landing", "Register"];

const NAV_LABELS = {
  en: { browse: "Browse Companies", requests: "View Requests", connections: "Connections", profile: "Profile", admin: "Admin Panel", signout: "Sign Out" },
  gr: { browse: "Εταιρείες", requests: "Αιτήματα", connections: "Συνδέσεις", profile: "Προφίλ", admin: "Διαχειριστής", signout: "Αποσύνδεση" },
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang, setLang } = useLang();

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
        <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const labels = NAV_LABELS[lang];
  const navItems = [
    { name: labels.browse, page: "BrowseCompanies", icon: Building2 },
    { name: labels.requests, page: "BuyerRequests", icon: FileText },
    { name: labels.connections, page: "Connections", icon: Link2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <style>{`
        :root {
          --cn-navy: #1B3A6B;
          --cn-navy-light: #162f58;
          --cn-teal: #00AEEF;
          --cn-teal-light: #33C1F5;
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
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#1B3A6B] text-white z-50 
          transform transition-transform duration-300 ease-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/10">
          <Link to={createPageUrl("BrowseCompanies")} className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/699c29f5a59121aa54dbc179/82eb061a0_commerce-nexus-logo-400x130.png" alt="Commerce Nexus" className="h-8 w-auto brightness-0 invert" />
          </Link>
        </div>

        {company && user?.role !== "admin" && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              {company.logo_url ? (
                <img src={company.logo_url} className="w-8 h-8 rounded-md object-cover" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-md bg-[#00AEEF]/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#00AEEF]" />
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
                    ? "bg-[#00AEEF] text-white shadow-lg shadow-[#00AEEF]/20"
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
          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-1 mb-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setLang("en")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${lang === "en" ? "bg-[#00AEEF] text-white" : "text-white/50 hover:text-white"}`}
            >EN</button>
            <button
              onClick={() => setLang("gr")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${lang === "gr" ? "bg-[#00AEEF] text-white" : "text-white/50 hover:text-white"}`}
            >ΕΛ</button>
          </div>

          <Link
            to={createPageUrl("Profile")}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${currentPageName === "Profile"
                ? "bg-[#00AEEF] text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
          >
            <User className="w-[18px] h-[18px]" />
            <span className="font-medium">{labels.profile}</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              to={createPageUrl("AdminDashboard")}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${currentPageName === "AdminDashboard"
                  ? "bg-[#00AEEF] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <ShieldCheck className="w-[18px] h-[18px]" />
              <span className="font-medium">{labels.admin}</span>
            </Link>
          )}
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="font-medium">{labels.signout}</span>
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
                <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center">
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