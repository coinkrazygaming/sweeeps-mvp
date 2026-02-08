import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { storeAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Zap } from "lucide-react";

export default function Store() {
  const { user, accessToken, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [validPromo, setValidPromo] = useState<any>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/login");
      return;
    }

    const loadPackages = async () => {
      try {
        const response = await storeAPI.listPackages();
        setPackages(response.packages || []);
      } catch (error) {
        console.error("Failed to load packages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [user, accessToken, navigate]);

  const validatePromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await storeAPI.validatePromoCode(promoCode);
      setValidPromo(result);
    } catch (error) {
      setValidPromo(null);
      alert("Invalid promo code");
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!accessToken) return;

    setPurchasing(packageId);

    try {
      // In real implementation, this would integrate with Stripe
      const stripeTransactionId = `test_${Date.now()}`;
      const result = await storeAPI.completePurchase(
        accessToken,
        packageId,
        stripeTransactionId,
        validPromo?.code,
      );

      alert("Purchase successful!");
      setPromoCode("");
      setValidPromo(null);
      await refreshBalance();
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Purchase failed");
    } finally {
      setPurchasing(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-yellow-400" />
            Gold Coin Store
          </h1>
          <p className="text-slate-400 text-lg">
            Purchase Gold Coins for entertainment play and receive free
            Sweepstakes Coins bonus!
          </p>
        </div>

        {/* Current Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-yellow-400/20">
            <h3 className="text-slate-400 font-medium mb-2">Your Gold Coins</h3>
            <p className="text-4xl font-bold text-yellow-400">
              {user.goldCoins.toFixed(2)}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              For entertainment play
            </p>
          </div>
          <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-purple-400/20">
            <h3 className="text-slate-400 font-medium mb-2">
              Your Sweepstakes Coins
            </h3>
            <p className="text-4xl font-bold text-purple-400">
              {user.sweepstakesCoins.toFixed(2)}
            </p>
            <p className="text-sm text-slate-500 mt-2">Redeemable for prizes</p>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/10 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">
            Have a Promo Code?
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
            <Button
              onClick={validatePromo}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 rounded-lg"
            >
              Apply
            </Button>
          </div>
          {validPromo && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 font-semibold">
                {validPromo.description}
              </p>
              <p className="text-sm text-green-300 mt-1">
                {validPromo.bonusType === "percentage"
                  ? `${validPromo.bonusAmount}% off`
                  : `+${validPromo.bonusAmount} bonus`}
              </p>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading packages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.id}
                className={`group glass rounded-2xl p-8 backdrop-blur-xl border transition relative overflow-hidden ${
                  idx === packages.length - 1
                    ? "border-yellow-400/50 lg:col-span-1"
                    : "border-white/10"
                }`}
              >
                {/* Best Value Badge */}
                {idx === packages.length - 1 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-bold text-slate-900">
                      Best Value
                    </span>
                  </div>
                )}

                {/* Package Info */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {pkg.name}
                  </h3>
                  {pkg.description && (
                    <p className="text-slate-400 text-sm">{pkg.description}</p>
                  )}
                </div>

                {/* Coins Display */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                    <span className="text-yellow-400 font-semibold">
                      Gold Coins
                    </span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {Math.floor(pkg.goldCoins)}
                    </span>
                  </div>
                  {pkg.bonusSweeepstakesCoins > 0 && (
                    <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                      <span className="text-purple-400 font-semibold">
                        Bonus Sweepstakes
                      </span>
                      <span className="text-2xl font-bold text-purple-400">
                        +{Math.floor(pkg.bonusSweeepstakesCoins)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg">
                  <p className="text-sm text-slate-400">Price</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    ${(pkg.priceCents / 100).toFixed(2)}
                  </p>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className="w-full gradient-gold text-slate-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {purchasing === pkg.id ? "Processing..." : "Purchase Now"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Compliance Notice */}
        <div className="mt-16 text-center p-8 bg-slate-800/30 border border-slate-700 rounded-xl">
          <h3 className="text-white font-semibold mb-2">
            💰 No Purchase Necessary
          </h3>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            You can earn Free Sweepstakes Coins through daily logins and
            gameplay. Purchase of Gold Coins is optional for faster gameplay and
            bonus Sweepstakes Coins.
          </p>
        </div>
      </div>
    </div>
  );
}
