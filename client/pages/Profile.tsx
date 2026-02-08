import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { usersAPI, redemptionsAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import KYCForm, { KYCData } from "@/components/KYCForm";
import { User, History, Gift, LogOut, Shield } from "lucide-react";

export default function Profile() {
  const { user, accessToken, logout, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [tab, setTab] = useState<"transactions" | "games" | "redeem" | "kyc">(
    "transactions",
  );
  const [loading, setLoading] = useState(true);
  const [redemptionAmount, setRedemptionAmount] = useState(100);
  const [redeeming, setRedeeming] = useState(false);
  const [kycStatus, setKYCStatus] = useState<"UNVERIFIED" | "PENDING" | "VERIFIED">("UNVERIFIED");
  const [kycLoading, setKYCLoading] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [txResponse, gamesResponse] = await Promise.all([
          usersAPI.getTransactionHistory(accessToken),
          usersAPI.getGameHistory(accessToken),
        ]);

        setTransactions(txResponse.transactions || []);
        setGames(gamesResponse.games || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, accessToken, navigate]);

  const handleRedeem = async () => {
    if (!accessToken || redemptionAmount > user!.sweepstakesCoins) {
      alert("Insufficient sweepstakes coins");
      return;
    }

    setRedeeming(true);
    try {
      await redemptionsAPI.createRedemptionRequest(
        accessToken,
        redemptionAmount,
        "Sweepstakes Prize Redemption",
      );

      alert("Redemption request submitted! Admin will review shortly.");
      setRedemptionAmount(100);
      await refreshBalance();
    } catch (error) {
      console.error("Redemption error:", error);
      alert("Failed to submit redemption request");
    } finally {
      setRedeeming(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <User className="w-8 h-8 text-yellow-400" />
              {user.username}
            </h1>
            <p className="text-slate-400 mt-2">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-yellow-400/20">
            <h3 className="text-slate-400 font-medium mb-2">
              Gold Coins Balance
            </h3>
            <p className="text-4xl font-bold text-yellow-400">
              {user.goldCoins.toFixed(2)}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              For entertainment play
            </p>
            <a
              href="/store"
              className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 font-semibold"
            >
              Buy Coins →
            </a>
          </div>
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-purple-400/20">
            <h3 className="text-slate-400 font-medium mb-2">
              Sweepstakes Balance
            </h3>
            <p className="text-4xl font-bold text-purple-400">
              {user.sweepstakesCoins.toFixed(2)}
            </p>
            <p className="text-sm text-slate-500 mt-2">Redeemable for prizes</p>
            <button
              onClick={() => setTab("redeem")}
              className="inline-block mt-4 text-purple-400 hover:text-purple-300 font-semibold"
            >
              Redeem Now →
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("transactions")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              tab === "transactions"
                ? "gradient-gold text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <History className="w-5 h-5" />
            Transactions
          </button>
          <button
            onClick={() => setTab("games")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              tab === "games"
                ? "gradient-gold text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Game History
          </button>
          <button
            onClick={() => setTab("redeem")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              tab === "redeem"
                ? "gradient-gold text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Gift className="w-5 h-5" />
            Redeem
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Transactions Tab */}
            {tab === "transactions" && (
              <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">
                  Transaction History
                </h2>
                {transactions.length === 0 ? (
                  <p className="text-slate-400">No transactions yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-semibold capitalize">
                            {tx.type.replace("_", " ")}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.amount > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount.toFixed(2)} {tx.currencyType}
                          </p>
                          <p className="text-sm text-slate-500">
                            {tx.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Games Tab */}
            {tab === "games" && (
              <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">
                  Game History
                </h2>
                {games.length === 0 ? (
                  <p className="text-slate-400">No games played yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-semibold">
                            {game.gameName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(game.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300">
                            Bet: {game.betAmount.toFixed(2)} {game.currencyType}
                          </p>
                          <p
                            className={`font-bold ${game.winAmount > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {game.winAmount > 0 ? "+" : ""}
                            {game.winAmount.toFixed(2)} {game.currencyType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Redeem Tab */}
            {tab === "redeem" && (
              <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-yellow-400" />
                  Redeem Sweepstakes Coins
                </h2>

                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 mb-2">Current Balance</p>
                    <p className="text-4xl font-bold text-purple-400 mb-6">
                      {user.sweepstakesCoins.toFixed(2)} SC
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Redemption Amount (Minimum: 100 SC)
                    </label>
                    <input
                      type="number"
                      value={redemptionAmount}
                      onChange={(e) =>
                        setRedemptionAmount(
                          Math.max(100, parseFloat(e.target.value) || 100),
                        )
                      }
                      min={100}
                      max={user.sweepstakesCoins}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 mb-4"
                    />
                  </div>

                  <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      ℹ️ Your redemption request will be reviewed by an
                      administrator. Once approved, you'll receive your prize.
                    </p>
                  </div>

                  <Button
                    onClick={handleRedeem}
                    disabled={
                      redeeming || redemptionAmount > user.sweepstakesCoins
                    }
                    className="w-full gradient-gold text-slate-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {redeeming ? "Processing..." : "Request Redemption"}
                  </Button>

                  <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">
                      Compliance Notice
                    </h3>
                    <p className="text-sm text-slate-400">
                      This platform is a sweepstakes social casino. Sweepstakes
                      Coins are earned through gameplay and bonuses, not
                      purchased. All redemptions are subject to terms and
                      conditions. No purchase necessary.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
