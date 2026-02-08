import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Check, Clock, AlertCircle } from "lucide-react";

interface KYCFormProps {
  onSubmit: (data: KYCData) => Promise<void>;
  loading?: boolean;
  kycStatus?: "UNVERIFIED" | "PENDING" | "VERIFIED";
}

export interface KYCData {
  fullName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function KYCForm({
  onSubmit,
  loading = false,
  kycStatus = "UNVERIFIED",
}: KYCFormProps) {
  const [formData, setFormData] = useState<KYCData>({
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.dateOfBirth || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await onSubmit(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("KYC submission error:", error);
    }
  };

  const getStatusIcon = () => {
    switch (kycStatus) {
      case "VERIFIED":
        return <Check className="w-5 h-5 text-green-400" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (kycStatus) {
      case "VERIFIED":
        return "Your account is verified";
      case "PENDING":
        return "Your verification is pending review";
      default:
        return "Your account is not verified";
    }
  };

  if (kycStatus === "VERIFIED") {
    return (
      <div className="glass rounded-xl p-6 border border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-3 mb-3">
          {getStatusIcon()}
          <h3 className="text-lg font-semibold text-green-400">Verified</h3>
        </div>
        <p className="text-slate-400">{getStatusText()}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">
          Know Your Customer (KYC)
        </h3>
      </div>

      {kycStatus === "PENDING" && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-yellow-400">
              Verification Pending
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Your KYC information is under review. This typically takes 1-2
            business days.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            placeholder="John Doe"
            required
            disabled={kycStatus === "PENDING"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            required
            disabled={kycStatus === "PENDING"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Street Address <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            placeholder="123 Main Street"
            required
            disabled={kycStatus === "PENDING"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              placeholder="New York"
              disabled={kycStatus === "PENDING"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              placeholder="NY"
              disabled={kycStatus === "PENDING"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Zip Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              placeholder="10001"
              disabled={kycStatus === "PENDING"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              disabled={kycStatus === "PENDING"}
            >
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="Mexico">Mexico</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={
              loading || kycStatus === "PENDING" || kycStatus === "VERIFIED"
            }
            className="w-full gradient-gold text-slate-900 font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit KYC Information"}
          </Button>
        </div>
      </form>

      <p className="text-xs text-slate-500 mt-4">
        Your information is securely stored and encrypted. We comply with
        KYC/AML regulations.
      </p>
    </div>
  );
}
