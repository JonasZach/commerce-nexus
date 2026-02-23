import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import CompanyTypeStep from "@/components/register/CompanyTypeStep";
import CompanyInfoStep from "@/components/register/CompanyInfoStep";
import SupplierPlanStep from "@/components/register/SupplierPlanStep";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=type, 2=info, 3=plan (supplier only)
  const [companyType, setCompanyType] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const me = await base44.auth.me();
        const companies = await base44.entities.Company.filter({ created_by: me.email });
        if (companies.length > 0) {
          navigate(createPageUrl("Dashboard"));
        }
      }
    };
    checkExisting();
  }, []);

  const handleTypeSelect = (type) => {
    setCompanyType(type);
    setStep(2);
  };

  const handleInfoChange = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleInfoNext = () => {
    if (companyType === "supplier") {
      setStep(3);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      // Store data in session, redirect to login
      sessionStorage.setItem("cn_register_data", JSON.stringify({
        ...formData,
        company_type: companyType,
        membership_plan: companyType === "supplier" ? selectedPlan : "free",
        is_active_member: selectedPlan !== "free",
      }));
      base44.auth.redirectToLogin(createPageUrl("Register") + "?complete=true");
      return;
    }

    await createCompany();
  };

  const createCompany = async () => {
    const now = new Date();
    const planData = {};
    if (companyType === "supplier" && selectedPlan !== "free") {
      planData.membership_start_date = now.toISOString().split("T")[0];
      const months = selectedPlan === "6_months" ? 6 : 12;
      const end = new Date(now);
      end.setMonth(end.getMonth() + months);
      planData.membership_end_date = end.toISOString().split("T")[0];
      planData.is_active_member = true;
    }

    await base44.entities.Company.create({
      ...formData,
      company_type: companyType,
      membership_plan: companyType === "supplier" ? selectedPlan : "free",
      profile_completed: true,
      ...planData,
    });

    navigate(createPageUrl("Dashboard"));
  };

  // Handle post-login redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("complete") === "true") {
      const stored = sessionStorage.getItem("cn_register_data");
      if (stored) {
        const data = JSON.parse(stored);
        setCompanyType(data.company_type);
        setFormData(data);
        setSelectedPlan(data.membership_plan || "free");
        sessionStorage.removeItem("cn_register_data");
        // Auto-create after login
        setTimeout(async () => {
          setSaving(true);
          const now = new Date();
          const planData = {};
          if (data.company_type === "supplier" && data.membership_plan !== "free") {
            planData.membership_start_date = now.toISOString().split("T")[0];
            const months = data.membership_plan === "6_months" ? 6 : 12;
            const end = new Date(now);
            end.setMonth(end.getMonth() + months);
            planData.membership_end_date = end.toISOString().split("T")[0];
            planData.is_active_member = true;
          }
          await base44.entities.Company.create({
            ...data,
            profile_completed: true,
            ...planData,
          });
          navigate(createPageUrl("Dashboard"));
        }, 500);
      }
    }
  }, []);

  const steps = companyType === "supplier" ? 3 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: steps }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step > i + 1 ? "bg-[#2AA5A0] text-white" : step === i + 1 ? "bg-[#1B2A4A] text-white" : "bg-slate-200 text-slate-500"}
              `}>
                {i + 1}
              </div>
              {i < steps - 1 && (
                <div className={`w-12 h-0.5 mx-1 ${step > i + 1 ? "bg-[#2AA5A0]" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <CompanyTypeStep onSelect={handleTypeSelect} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <CompanyInfoStep
                  data={formData}
                  onChange={handleInfoChange}
                  onNext={handleInfoNext}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 3 && companyType === "supplier" && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <SupplierPlanStep
                  selectedPlan={selectedPlan}
                  onSelect={setSelectedPlan}
                  onBack={() => setStep(2)}
                  onComplete={handleComplete}
                  saving={saving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            className="text-[#2AA5A0] font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}