import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { adminAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, CheckCircle, XCircle } from "lucide-react";

export default function Admin() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"analytics" | "redemptions">("analytics");
  const [analytics, setAnalytics] = useState<any>(null);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  // Check if user has admin role
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      if (!accessToken) return;

      try {
        if (tab === "analytics") {
          const analyticsData = await adminAPI.getAnalytics(accessToken);
          setAnalytics(analyticsData);
        } else {
          const redemptionsList = await adminAPI.listRedemptions(
            accessToken,
            "pending",
          );
          setRedemptions(redemptionsList.redemptions || []);
        }
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin, navigate, accessToken, tab]);

  const handleApproveRedemption = async (redemptionId: string) => {
    if (!accessToken) return;

    setApproving(redemptionId);
    try {
      await adminAPI.approveRedemption(accessToken, redemptionId);
      alert("Redemption approved!");
      setRedemptions(redemptions.filter((r) => r.id !== redemptionId));
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve redemption");
    } finally {
      setApproving(null);
    }
  };

  const handleRejectRedemption = async (redemptionId: string) => {
    if (!accessToken) return;

    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setApproving(redemptionId);
    try {
      await adminAPI.rejectRedemption(accessToken, redemptionId, reason);
      alert("Redemption rejected!");
      setRedemptions(redemptions.filter((r) => r.id !== redemptionId));
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject redemption");
    } finally {
      setApproving(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            Access Denied
          </h1>
          <p className="text-slate-400 mb-8">
            You don't have permission to access the admin panel.
          </p>
          <a
            href="/"
            className="text-yellow-400 hover:text-yellow-300 font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-400" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Manage platform users, redemptions, and view analytics
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => {
              setTab("analytics");
              setLoading(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              tab === "analytics"
                ? "gradient-gold text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => {
              setTab("redemptions");
              setLoading(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              tab === "redemptions"
                ? "gradient-gold text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Redemptions
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Analytics Tab */}
            {tab === "analytics" && analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                  <h3 className="text-slate-400 font-medium mb-2">
                    Daily Active Users
                  </h3>
                  <p className="text-4xl font-bold text-yellow-400">
                    {analytics.dau}
                  </p>
                </div>
                <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                  <h3 className="text-slate-400 font-medium mb-2">
                    Monthly Active Users
                  </h3>
                  <p className="text-4xl font-bold text-yellow-400">
                    {analytics.mau}
                  </p>
                </div>
                <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                  <h3 className="text-slate-400 font-medium mb-2">
                    Total Users
                  </h3>
                  <p className="text-4xl font-bold text-purple-400">
                    {analytics.totalUsers}
                  </p>
                </div>
                <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                  <h3 className="text-slate-400 font-medium mb-2">
                    Total Revenue
                  </h3>
                  <p className="text-4xl font-bold text-green-400">
                    ${(analytics.totalRevenueCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Currency Distribution */}
            {tab === "analytics" && analytics && (
              <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">
                  Currency Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-yellow-400 font-semibold mb-2">
                      Total Gold Coins
                    </h3>
                    <p className="text-4xl font-bold text-yellow-400">
                      {analytics.currencyDistribution.totalGoldCoins.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-purple-400 font-semibold mb-2">
                      Total Sweepstakes Coins
                    </h3>
                    <p className="text-4xl font-bold text-purple-400">
                      {analytics.currencyDistribution.totalSweeepstakesCoins.toFixed(
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Redemptions Tab */}
            {tab === "redemptions" && (
              <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">
                  Pending Redemptions
                </h2>

                {redemptions.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No pending redemptions
                  </p>
                ) : (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <div
                        key={redemption.id}
                        className="flex items-center justify-between p-6 bg-slate-800/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">
                            {redemption.username}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {redemption.email}
                          </p>
                          <div className="mt-2 flex gap-6">
                            <span className="text-yellow-400">
                              <strong>
                                {redemption.sweepstakesCoins.toFixed(2)} SC
                              </strong>
                            </span>
                            <span className="text-slate-300">
                              {new Date(
                                redemption.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {redemption.prizeDescription && (
                            <p className="text-sm text-slate-500 mt-2">
                              {redemption.prizeDescription}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              handleApproveRedemption(redemption.id)
                            }
                            disabled={approving === redemption.id}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() =>
                              handleRejectRedemption(redemption.id)
                            }
                            disabled={approving === redemption.id}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
