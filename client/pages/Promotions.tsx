import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Gift, TrendingUp, Zap } from "lucide-react";

const promotions = [
  {
    title: "Daily Login Bonus",
    description: "Claim free sweepstakes coins every day you log in",
    icon: Gift,
    details: [
      "100+ Sweepstakes Coins daily",
      "No purchase required",
      "Claim anytime",
    ],
    badge: "Active",
    badgeColor: "bg-green-500/20 text-green-200 border-green-500/50",
  },
  {
    title: "Welcome Bonus",
    description: "New players get an instant bonus package",
    icon: Zap,
    details: [
      "500 Gold Coins bonus",
      "1,000 Sweepstakes Coins",
      "Valid for 30 days",
    ],
    badge: "Active",
    badgeColor: "bg-green-500/20 text-green-200 border-green-500/50",
  },
  {
    title: "Weekly Multiplier",
    description: "Double your winnings on select games each week",
    icon: TrendingUp,
    details: [
      "2x winnings on featured games",
      "New games weekly",
      "Ends at midnight Sunday",
    ],
    badge: "Active",
    badgeColor: "bg-green-500/20 text-green-200 border-green-500/50",
  },
  {
    title: "Referral Rewards",
    description: "Earn coins when you refer friends",
    icon: Gift,
    details: [
      "500 coins per successful referral",
      "Unlimited earning potential",
      "Instant credits",
    ],
    badge: "Coming Soon",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/50",
  },
  {
    title: "VIP Tier Bonuses",
    description: "Exclusive rewards based on your play level",
    icon: Crown,
    details: [
      "Higher daily bonuses",
      "Exclusive games access",
      "Priority support",
    ],
    badge: "Coming Soon",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/50",
  },
  {
    title: "Holiday Specials",
    description: "Special promotions during holidays and events",
    icon: Gift,
    details: [
      "Seasonal bonus packages",
      "Limited time offers",
      "Extra winning chances",
    ],
    badge: "Coming Soon",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/50",
  },
];

export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <Crown className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold gradient-gold bg-clip-text text-transparent">
                CrownPlay
              </span>
            </Link>
            <div className="flex gap-4">
              <Button asChild variant="ghost" className="text-slate-300">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="gradient-gold">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4 text-white">
          Active Promotions
        </h1>
        <p className="text-xl text-slate-400">
          Check out all our current offers and upcoming rewards
        </p>
      </section>

      {/* Promotions Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo, idx) => {
            const Icon = promo.icon;
            return (
              <div
                key={idx}
                className="group glass rounded-xl border border-white/10 p-8 hover:border-white/20 transition overflow-hidden"
              >
                {/* Badge */}
                <div className="flex justify-between items-start mb-4">
                  <Icon className="w-10 h-10 text-yellow-400" />
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${promo.badgeColor}`}
                  >
                    {promo.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {promo.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  {promo.description}
                </p>

                {/* Details */}
                <ul className="space-y-3 mb-8">
                  {promo.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-400"
                    >
                      <span className="text-yellow-400 font-bold mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-800"
                >
                  <Link to="/signup">Claim Now</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Terms Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass rounded-2xl p-12 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Promotion Terms & Conditions
          </h2>
          <div className="space-y-4 text-slate-400">
            <p>
              <strong className="text-white">Eligibility:</strong> Promotions
              are available to registered users who meet all eligibility
              requirements. Some promotions may be restricted by location.
            </p>
            <p>
              <strong className="text-white">Limitations:</strong> Each
              promotion can typically be claimed once per account. Multiple
              account abuse will result in account suspension.
            </p>
            <p>
              <strong className="text-white">Expiration:</strong> Promotional
              bonuses expire as indicated in the specific promotion details.
              Unused bonuses forfeit after expiration.
            </p>
            <p>
              <strong className="text-white">Modifications:</strong> CrownPlay
              reserves the right to modify, suspend, or cancel promotions at any
              time without notice.
            </p>
            <p>
              <strong className="text-white">Withdrawal:</strong> Some
              promotional bonuses may have wagering requirements before
              withdrawal. Check promotion details for specifics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass rounded-2xl p-12 border border-yellow-400/20 bg-yellow-400/5 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't miss out on these amazing rewards!
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Sign up today and start claiming bonuses immediately
          </p>
          <Button asChild size="lg" className="gradient-gold text-slate-900">
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            © 2024 CrownPlay. All rights reserved. | Responsible Gaming | 18+
            Only
          </p>
        </div>
      </footer>
    </div>
  );
}
