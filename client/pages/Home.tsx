import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Crown, Zap, TrendingUp, Shield, Gift, Users } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500 opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold gradient-gold bg-clip-text text-transparent">
                CrownPlay
              </span>
            </div>
            <div className="flex gap-4">
              {user ? (
                <>
                  <Button asChild variant="ghost" className="text-slate-300">
                    <Link to="/">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" className="text-slate-300">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="gradient-gold">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-gold bg-clip-text text-transparent">
              Experience the Thrill
            </span>
            <br />
            <span className="text-white">of Social Casino Gaming</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Play exciting games, win real rewards, and claim amazing prizes. No purchase necessary to play and win.
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="gradient-gold text-slate-900">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <Link to="/login">Already Playing?</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">
          Why Choose CrownPlay?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass rounded-xl p-8 border border-white/10">
            <Gift className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">No Purchase Required</h3>
            <p className="text-slate-400">
              Claim daily bonuses and free sweepstakes coins every day. Play for free and still win real prizes.
            </p>
          </div>
          <div className="glass rounded-xl p-8 border border-white/10">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">10+ Thrilling Games</h3>
            <p className="text-slate-400">
              From slots to roulette, blackjack to dice roll. Fresh gameplay every time with exciting rewards.
            </p>
          </div>
          <div className="glass rounded-xl p-8 border border-white/10">
            <TrendingUp className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Real Prize Redemptions</h3>
            <p className="text-slate-400">
              Win sweepstakes coins and redeem them for real prizes. Quick approval process and secure transfers.
            </p>
          </div>
          <div className="glass rounded-xl p-8 border border-white/10">
            <Shield className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Fully Secure & Verified</h3>
            <p className="text-slate-400">
              Your account and transactions are protected with enterprise-grade security and encryption.
            </p>
          </div>
          <div className="glass rounded-xl p-8 border border-white/10">
            <Users className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Active Community</h3>
            <p className="text-slate-400">
              Join thousands of players enjoying daily games, promotions, and exclusive rewards.
            </p>
          </div>
          <div className="glass rounded-xl p-8 border border-white/10">
            <Crown className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Instant Bonuses</h3>
            <p className="text-slate-400">
              Claim instant daily bonuses, special promotions, and earn loyalty rewards every day you play.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: "Sign Up", desc: "Create your account in seconds" },
            { step: 2, title: "Claim Bonuses", desc: "Get free coins to start playing" },
            { step: 3, title: "Play Games", desc: "Enjoy 10+ exciting casino games" },
            { step: 4, title: "Redeem Prizes", desc: "Convert wins to real rewards" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-full glass border border-yellow-400 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-400">{item.step}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass rounded-2xl p-12 border border-white/20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of players winning big every day. Sign up now and claim your welcome bonus!
          </p>
          {!user && (
            <Button asChild size="lg" className="gradient-gold text-slate-900">
              <Link to="/signup">Start Playing Now</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">CrownPlay</h4>
              <p className="text-slate-400 text-sm">Your premier social casino gaming platform.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-slate-400 hover:text-yellow-400 text-sm transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-400 hover:text-yellow-400 text-sm transition">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-slate-400 hover:text-yellow-400 text-sm transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@crownplay.com" className="text-slate-400 hover:text-yellow-400 text-sm transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Promotions</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/promotions" className="text-slate-400 hover:text-yellow-400 text-sm transition">
                    Active Promotions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-500 text-sm mb-2">
              © 2024 CrownPlay. All rights reserved.
            </p>
            <p className="text-center text-slate-600 text-xs">
              Responsible Gaming | 18+ Only | No Purchase Necessary to Play or Win
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
